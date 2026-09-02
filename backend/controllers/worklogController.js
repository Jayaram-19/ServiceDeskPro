const WorkLog = require('../models/WorkLog');
const Ticket = require('../models/Ticket');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// POST /api/tickets/:id/worklogs
const addWorkLog = async (req, res, next) => {
  try {
    const { description, timeSpentMinutes, activityType } = req.body;
    const { _id: userId, organization } = req.user;

    const ticket = await Ticket.findOne({ _id: req.params.id, organization });
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    const workLog = await WorkLog.create({
      ticket: ticket._id,
      technician: userId,
      description,
      timeSpentMinutes: parseInt(timeSpentMinutes),
      activityType,
    });

    ticket.history.push({ action: 'Work Log Added', performedBy: userId, note: `${timeSpentMinutes} minutes - ${activityType}` });
    await ticket.save();

    const populated = await workLog.populate('technician', 'name email avatar');
    return successResponse(res, { workLog: populated }, 'Work log added', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/:id/worklogs
const getWorkLogs = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const ticket = await Ticket.findOne({ _id: req.params.id, organization });
    if (!ticket) return errorResponse(res, 'Ticket not found', 404);

    const logs = await WorkLog.find({ ticket: req.params.id })
      .populate('technician', 'name email avatar')
      .sort({ createdAt: -1 });

    const totalMinutes = logs.reduce((sum, l) => sum + l.timeSpentMinutes, 0);
    return successResponse(res, { workLogs: logs, totalMinutes });
  } catch (err) {
    next(err);
  }
};

module.exports = { addWorkLog, getWorkLogs };
