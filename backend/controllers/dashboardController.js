const Ticket = require('../models/Ticket');
const Asset = require('../models/Asset');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { successResponse } = require('../utils/apiResponse');

// GET /api/dashboard/manager
const getManagerDashboard = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      totalTickets, openTickets, inProgressTickets, resolvedTickets,
      slaBreached, closedTickets,
      ticketsByPriority, ticketsByCategory, ticketsByStatus,
      recentTickets, technicianWorkload,
    ] = await Promise.all([
      Ticket.countDocuments({ organization }),
      Ticket.countDocuments({ organization, status: 'Open' }),
      Ticket.countDocuments({ organization, status: 'In Progress' }),
      Ticket.countDocuments({ organization, status: 'Resolved' }),
      Ticket.countDocuments({ organization, slaBreached: true, status: { $nin: ['Closed', 'Cancelled'] } }),
      Ticket.countDocuments({ organization, status: 'Closed' }),
      Ticket.aggregate([{ $match: { organization } }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Ticket.aggregate([
        { $match: { organization, category: { $ne: null } } },
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'cat' } },
        { $group: { _id: { $arrayElemAt: ['$cat.name', 0] }, count: { $sum: 1 } } },
      ]),
      Ticket.aggregate([{ $match: { organization } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Ticket.find({ organization }).sort({ createdAt: -1 }).limit(5)
        .populate('requester', 'name').populate('assignedTo', 'name').populate('category', 'name'),
      Ticket.aggregate([
        { $match: { organization, assignedTo: { $ne: null }, status: { $nin: ['Closed', 'Resolved', 'Cancelled'] } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $project: { count: 1, name: { $arrayElemAt: ['$user.name', 0] }, avatar: { $arrayElemAt: ['$user.avatar', 0] } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const totalResolved = resolvedTickets + closedTickets;
    const slaComplianceRate = totalTickets > 0 ? (((totalTickets - slaBreached) / totalTickets) * 100).toFixed(1) : 100;

    return successResponse(res, {
      stats: {
        totalTickets, openTickets, inProgressTickets, resolvedTickets,
        slaBreached, closedTickets, slaComplianceRate: parseFloat(slaComplianceRate),
      },
      charts: { ticketsByPriority, ticketsByCategory, ticketsByStatus },
      technicianWorkload,
      recentTickets,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/technician
const getTechnicianDashboard = async (req, res, next) => {
  try {
    const { _id: userId, organization } = req.user;

    const [assigned, inProgress, slaWarning, slaBreached, resolvedThisWeek, recentTickets] = await Promise.all([
      Ticket.countDocuments({ organization, assignedTo: userId, status: 'Assigned' }),
      Ticket.countDocuments({ organization, assignedTo: userId, status: 'In Progress' }),
      Ticket.countDocuments({
        organization, assignedTo: userId,
        slaDeadline: { $lt: new Date(Date.now() + 2 * 60 * 60 * 1000) },
        slaBreached: false,
        status: { $nin: ['Resolved', 'Closed', 'Cancelled'] },
      }),
      Ticket.countDocuments({ organization, assignedTo: userId, slaBreached: true, status: { $nin: ['Closed', 'Cancelled'] } }),
      Ticket.countDocuments({
        organization, assignedTo: userId, status: { $in: ['Resolved', 'Closed'] },
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
      Ticket.find({ organization, assignedTo: userId, status: { $nin: ['Closed', 'Cancelled'] } })
        .sort({ slaDeadline: 1 }).limit(10)
        .populate('requester', 'name avatar')
        .populate('category', 'name'),
    ]);

    return successResponse(res, {
      stats: { assigned, inProgress, slaWarning, slaBreached, resolvedThisWeek },
      recentTickets,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/employee
const getEmployeeDashboard = async (req, res, next) => {
  try {
    const { _id: userId, organization } = req.user;

    const [open, pending, resolved, myAssets, recentTickets] = await Promise.all([
      Ticket.countDocuments({ organization, requester: userId, status: { $in: ['Open', 'Assigned', 'In Progress'] } }),
      Ticket.countDocuments({ organization, requester: userId, status: 'Pending' }),
      Ticket.countDocuments({ organization, requester: userId, status: { $in: ['Resolved', 'Closed'] } }),
      Asset.find({ organization, assignedTo: userId }).populate('department', 'name').limit(5),
      Ticket.find({ organization, requester: userId }).sort({ createdAt: -1 }).limit(5)
        .populate('category', 'name').populate('assignedTo', 'name avatar'),
    ]);

    return successResponse(res, {
      stats: { open, pending, resolved },
      myAssets,
      recentTickets,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/assets
const getAssetDashboard = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [total, assigned, available, underRepair, retired, expiringWarranties, byType] = await Promise.all([
      Asset.countDocuments({ organization }),
      Asset.countDocuments({ organization, status: 'Assigned' }),
      Asset.countDocuments({ organization, status: 'Available' }),
      Asset.countDocuments({ organization, status: 'Under Repair' }),
      Asset.countDocuments({ organization, status: 'Retired' }),
      Asset.find({ organization, warrantyExpiresAt: { $lte: thirtyDaysFromNow, $gte: new Date() } })
        .select('assetId name warrantyExpiresAt').limit(10),
      Asset.aggregate([{ $match: { organization } }, { $group: { _id: '$assetType', count: { $sum: 1 } } }]),
    ]);

    return successResponse(res, {
      stats: { total, assigned, available, underRepair, retired },
      expiringWarranties,
      byType,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/admin
const getAdminDashboard = async (req, res, next) => {
  try {
    const { organization } = req.user;

    const [users, tickets, assets, recentAuditLogs] = await Promise.all([
      User.aggregate([{ $match: { organization } }, { $group: { _id: '$role', count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $match: { organization } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Asset.aggregate([{ $match: { organization } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      AuditLog.find({ organization }).sort({ createdAt: -1 }).limit(20)
        .populate('performedBy', 'name role'),
    ]);

    return successResponse(res, { users, tickets, assets, recentAuditLogs });
  } catch (err) {
    next(err);
  }
};

module.exports = { getManagerDashboard, getTechnicianDashboard, getEmployeeDashboard, getAssetDashboard, getAdminDashboard };
