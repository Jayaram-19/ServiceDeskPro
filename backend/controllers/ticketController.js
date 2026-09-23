const Ticket = require('../models/Ticket');
const Category = require('../models/Category');
const User = require('../models/User');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { isValidTransition, TICKET_STATUSES } = require('../utils/ticketStateMachine');
const { applySLAPolicy } = require('../services/slaService');
const { classifyTicket, recommendArticles } = require('../services/aiService');
const { logAction } = require('../services/auditService');
const { notifyTicketAssigned, notifyStatusChanged, notifyTicketResolved } = require('../services/notificationService');

// GET /api/tickets
const getTickets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, category, assignedTo, department, search, slaStatus, startDate, endDate } = req.query;
    const { role, organization, _id: userId, department: userDept } = req.user;

    let query = { organization };

    // Role-based filtering removed to allow organization-wide visibility for all users
    if (role === 'technician') {
      // Technicians still only see assigned tickets by default in their specific views, 
      // but query allows seeing all if needed. Actually let's not restrict the base query.
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (department) query.department = department;
    if (slaStatus === 'breached') query.slaBreached = true;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) query.$text = { $search: search };

    const total = await Ticket.countDocuments(query);
    const tickets = await Ticket.find(query)
      .populate('requester', 'name email avatar department')
      .populate('assignedTo', 'name email avatar')
      .populate('category', 'name icon')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, tickets, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets
const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority, department } = req.body;
    const { _id: userId, organization } = req.user;

    // Prepare attachments
    const attachments = (req.files || []).map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      path: f.path,
      uploadedBy: userId,
    }));

    let ticket = new Ticket({
      title,
      description,
      requester: userId,
      organization,
      category,
      priority: priority || 'Medium',
      department,
      attachments,
      history: [{ action: 'Ticket Created', performedBy: userId, newValue: TICKET_STATUSES.OPEN }],
    });

    // Apply SLA
    ticket = await applySLAPolicy(ticket);

    // AI Classification (async, never blocks)
    const categories = await Category.find({ organization, isActive: true }).select('name');
    const categoryNames = categories.map(c => c.name);

    const [savedTicket] = await Promise.all([ticket.save()]);

    // Run AI classification after save (non-blocking)
    (async () => {
      try {
        const aiResult = await classifyTicket(title, description, categoryNames);
        if (aiResult) {
          const recommendations = await recommendArticles(title, description, organization);
          await Ticket.findByIdAndUpdate(savedTicket._id, {
            aiClassification: aiResult,
            linkedArticles: recommendations.map(a => a._id),
          });
        }
      } catch (e) {
        console.error('[TicketController] AI classification failed (non-fatal):', e.message);
      }
    })();

    await logAction({
      action: 'TICKET_CREATED',
      performedBy: userId,
      targetModel: 'Ticket',
      targetId: savedTicket._id,
      organization,
      details: { ticketId: savedTicket.ticketId, title },
      req,
    });

    const populated = await Ticket.findById(savedTicket._id)
      .populate('requester', 'name email avatar')
      .populate('category', 'name')
      .populate('department', 'name');

    return successResponse(res, { ticket: populated }, 'Ticket created successfully', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/:id
const getTicketById = async (req, res, next) => {
  try {
    const { role, _id: userId, organization } = req.user;
    const ticket = await Ticket.findOne({ _id: req.params.id, organization })
      .populate('requester', 'name email avatar department phone')
      .populate('assignedTo', 'name email avatar phone')
      .populate('category', 'name icon')
      .populate('department', 'name')
      .populate('slaPolicy')
      .populate('linkedArticles', 'title problemDescription solution tags status')
      .populate('history.performedBy', 'name role');

    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    // Employee and technician restrictions removed to allow organization-wide visibility

    return successResponse(res, { ticket });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tickets/:id
const updateTicket = async (req, res, next) => {
  try {
    const { role, _id: userId, organization } = req.user;
    const { title, description, category, priority, department, status, assignedTo, resolution } = req.body;

    const ticket = await Ticket.findOne({ _id: req.params.id, organization });
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    const historyEntries = [];

    // Status transition validation
    if (status && status !== ticket.status) {
      if (!isValidTransition(ticket.status, status)) {
        return errorResponse(res, `Invalid status transition: ${ticket.status} → ${status}`, 400);
      }
      // Role checks for specific transitions
      if (status === TICKET_STATUSES.CLOSED && role === 'employee') {
        return errorResponse(res, 'Employees cannot close tickets directly', 403);
      }
      if (status === TICKET_STATUSES.CANCELLED && !['admin', 'manager'].includes(role)) {
        return errorResponse(res, 'Only admins and managers can cancel tickets', 403);
      }

      historyEntries.push({ action: 'Status Changed', performedBy: userId, oldValue: ticket.status, newValue: status });

      if (status === TICKET_STATUSES.RESOLVED) {
        ticket.resolution = { note: resolution, resolvedBy: userId, resolvedAt: new Date() };
        await notifyTicketResolved(ticket, ticket.requester);
      }
      if (status === TICKET_STATUSES.CLOSED) ticket.closedAt = new Date();
      if (status === TICKET_STATUSES.REOPENED) ticket.reopenedAt = new Date();
      if (status === TICKET_STATUSES.CANCELLED) ticket.cancelledAt = new Date();

      // Notify status change to relevant parties
      await notifyStatusChanged(ticket, ticket.requester, ticket.status, status);

      ticket.status = status;
    }

    // Priority change (manager/admin only)
    if (priority && priority !== ticket.priority) {
      if (!['admin', 'manager'].includes(role)) {
        return errorResponse(res, 'Only managers can change priority', 403);
      }
      historyEntries.push({ action: 'Priority Changed', performedBy: userId, oldValue: ticket.priority, newValue: priority });
      ticket.priority = priority;
      // Re-calculate SLA
      ticket = await applySLAPolicy(ticket);
    }

    // Assignment (manager/admin only)
    if (assignedTo !== undefined && assignedTo !== ticket.assignedTo?.toString()) {
      if (!['admin', 'manager'].includes(role)) {
        return errorResponse(res, 'Only managers can assign tickets', 403);
      }
      const tech = await User.findOne({ _id: assignedTo, organization, role: { $in: ['technician', 'manager'] } });
      if (!tech) return errorResponse(res, 'Technician not found', 404);

      historyEntries.push({ action: 'Ticket Assigned', performedBy: userId, oldValue: ticket.assignedTo, newValue: assignedTo });
      ticket.assignedTo = assignedTo;
      if (ticket.status === TICKET_STATUSES.OPEN) ticket.status = TICKET_STATUSES.ASSIGNED;
      await notifyTicketAssigned(ticket, tech);
    }

    if (title && role !== 'employee') ticket.title = title;
    if (description && role !== 'employee') ticket.description = description;
    if (category) ticket.category = category;
    if (department) ticket.department = department;

    ticket.history.push(...historyEntries);
    await ticket.save();

    await logAction({ action: 'TICKET_UPDATED', performedBy: userId, targetModel: 'Ticket', targetId: ticket._id, organization, details: req.body, req });

    const updated = await Ticket.findById(ticket._id)
      .populate('requester', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('category', 'name')
      .populate('department', 'name');

    return successResponse(res, { ticket: updated }, 'Ticket updated');
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets/:id/assign
const assignTicket = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const { _id: userId, organization } = req.user;

    const ticket = await Ticket.findOne({ _id: req.params.id, organization });
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    const tech = await User.findOne({ _id: assignedTo, organization, role: { $in: ['technician', 'manager'] } });
    if (!tech) return errorResponse(res, 'Technician not found', 404);

    const oldAssignee = ticket.assignedTo;
    ticket.assignedTo = assignedTo;
    ticket.status = TICKET_STATUSES.ASSIGNED;
    ticket.history.push({ action: oldAssignee ? 'Ticket Reassigned' : 'Ticket Assigned', performedBy: userId, oldValue: oldAssignee, newValue: assignedTo });
    await ticket.save();

    await notifyTicketAssigned(ticket, tech);
    await logAction({ action: 'TICKET_ASSIGNED', performedBy: userId, targetModel: 'Ticket', targetId: ticket._id, organization, details: { assignedTo }, req });

    return successResponse(res, { ticket }, 'Ticket assigned');
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets/:id/resolve
const resolveTicket = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    const { _id: userId, organization, role } = req.user;

    if (!['technician', 'manager', 'admin'].includes(role)) {
      return errorResponse(res, 'Only technicians or managers can resolve tickets', 403);
    }

    const ticket = await Ticket.findOne({ _id: req.params.id, organization });
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);
    if (!isValidTransition(ticket.status, TICKET_STATUSES.RESOLVED)) {
      return errorResponse(res, `Cannot resolve ticket with status "${ticket.status}"`, 400);
    }
    if (!resolution) return errorResponse(res, 'Resolution note is required', 400);

    ticket.status = TICKET_STATUSES.RESOLVED;
    ticket.resolution = { note: resolution, resolvedBy: userId, resolvedAt: new Date() };
    ticket.history.push({ action: 'Ticket Resolved', performedBy: userId, newValue: TICKET_STATUSES.RESOLVED, note: resolution });
    await ticket.save();

    await notifyTicketResolved(ticket, ticket.requester);
    await logAction({ action: 'TICKET_RESOLVED', performedBy: userId, targetModel: 'Ticket', targetId: ticket._id, organization, details: { resolution }, req });

    return successResponse(res, { ticket }, 'Ticket resolved');
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets/:id/reopen
const reopenTicket = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const { _id: userId, organization, role } = req.user;

    const ticket = await Ticket.findOne({ _id: req.params.id, organization });
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);
    if (!isValidTransition(ticket.status, TICKET_STATUSES.REOPENED)) {
      return errorResponse(res, `Cannot reopen ticket with status "${ticket.status}"`, 400);
    }

    ticket.status = TICKET_STATUSES.REOPENED;
    ticket.reopenedAt = new Date();
    ticket.slaBreached = false; // Reset SLA on reopen
    ticket.history.push({ action: 'Ticket Reopened', performedBy: userId, newValue: TICKET_STATUSES.REOPENED, note: reason });
    await ticket.save();

    await logAction({ action: 'TICKET_REOPENED', performedBy: userId, targetModel: 'Ticket', targetId: ticket._id, organization, details: { reason }, req });

    return successResponse(res, { ticket }, 'Ticket reopened');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tickets/:id (admin only)
const deleteTicket = async (req, res, next) => {
  try {
    const { organization, _id: userId } = req.user;
    const ticket = await Ticket.findOneAndDelete({ _id: req.params.id, organization });
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);
    await logAction({ action: 'TICKET_DELETED', performedBy: userId, targetModel: 'Ticket', targetId: req.params.id, organization, req });
    return successResponse(res, {}, 'Ticket deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getTickets, createTicket, getTicketById, updateTicket, assignTicket, resolveTicket, reopenTicket, deleteTicket };
