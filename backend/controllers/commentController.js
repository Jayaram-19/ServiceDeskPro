const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { notifyNewComment } = require('../services/notificationService');
const { ticketScope } = require('../utils/accessControl');

// POST /api/tickets/:id/comments
const addComment = async (req, res, next) => {
  try {
    const { message, isInternal } = req.body;
    const { _id: userId, role, organization } = req.user;

    const ticket = await Ticket.findOne({ _id: req.params.id, ...ticketScope(req.user) });
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    // Employees cannot post internal notes
    const internal = isInternal === 'true' || isInternal === true;
    if (internal && !['admin', 'manager', 'technician'].includes(role)) {
      return errorResponse(res, 'Employees cannot post internal notes', 403);
    }

    const attachments = (req.files || []).map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
      path: f.path,
    }));

    const comment = await Comment.create({
      ticket: ticket._id,
      author: userId,
      message,
      isInternal: internal,
      attachments,
    });

    const populated = await comment.populate('author', 'name email avatar role');

    // Notify relevant parties (skip internal notes notification to employees)
    if (!comment.isInternal) {
      const recipients = new Set();
      if (ticket.requester.toString() !== userId.toString()) recipients.add(ticket.requester.toString());
      if (ticket.assignedTo && ticket.assignedTo.toString() !== userId.toString()) recipients.add(ticket.assignedTo.toString());
      for (const recipientId of recipients) {
        await notifyNewComment(ticket, recipientId, req.user.name);
      }
    }

    // Record in ticket history
    ticket.history.push({ action: internal ? 'Internal Note Added' : 'Comment Added', performedBy: userId });
    await ticket.save();

    return successResponse(res, { comment: populated }, 'Comment added', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/:id/comments
const getComments = async (req, res, next) => {
  try {
    const { role, _id: userId, organization } = req.user;

    const ticket = await Ticket.findOne({ _id: req.params.id, ...ticketScope(req.user) });
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    let query = { ticket: req.params.id };
    // Employees see only public comments
    if (role === 'employee') query.isInternal = false;

    const comments = await Comment.find(query)
      .populate('author', 'name email avatar role')
      .sort({ createdAt: 1 });

    return successResponse(res, { comments });
  } catch (err) {
    next(err);
  }
};

module.exports = { addComment, getComments };
