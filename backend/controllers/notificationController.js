const Notification = require('../models/Notification');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

// GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const { _id: userId } = req.user;

    const query = { recipient: userId };
    if (unreadOnly === 'true') query.isRead = false;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    return res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notif) return errorResponse(res, 'Notification not found', 404);
    return successResponse(res, { notification: notif }, 'Marked as read');
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true, readAt: new Date() });
    return successResponse(res, {}, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
