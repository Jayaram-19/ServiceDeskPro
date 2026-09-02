const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type, title, message, relatedEntity, link }) => {
  try {
    if (!recipient) return;
    await Notification.create({ recipient, type, title, message, relatedEntity, link });
  } catch (err) {
    console.error('[NotificationService] Failed to create notification:', err.message);
  }
};

const notifyTicketAssigned = async (ticket, technician) => {
  await createNotification({
    recipient: technician._id,
    type: 'ticket_assigned',
    title: 'New Ticket Assigned',
    message: `Ticket ${ticket.ticketId}: "${ticket.title}" has been assigned to you.`,
    relatedEntity: { type: 'Ticket', id: ticket._id },
    link: `/tickets/${ticket._id}`,
  });
};

const notifyStatusChanged = async (ticket, recipientId, oldStatus, newStatus) => {
  await createNotification({
    recipient: recipientId,
    type: 'ticket_status_changed',
    title: 'Ticket Status Updated',
    message: `Ticket ${ticket.ticketId} status changed from "${oldStatus}" to "${newStatus}".`,
    relatedEntity: { type: 'Ticket', id: ticket._id },
    link: `/tickets/${ticket._id}`,
  });
};

const notifyNewComment = async (ticket, recipientId, commenterName) => {
  await createNotification({
    recipient: recipientId,
    type: 'new_comment',
    title: 'New Comment on Ticket',
    message: `${commenterName} commented on ticket ${ticket.ticketId}: "${ticket.title}".`,
    relatedEntity: { type: 'Ticket', id: ticket._id },
    link: `/tickets/${ticket._id}`,
  });
};

const notifySLAWarning = async (ticket, recipientId) => {
  await createNotification({
    recipient: recipientId,
    type: 'sla_warning',
    title: '⚠️ SLA Warning',
    message: `Ticket ${ticket.ticketId} is approaching its SLA deadline.`,
    relatedEntity: { type: 'Ticket', id: ticket._id },
    link: `/tickets/${ticket._id}`,
  });
};

const notifySLABreach = async (ticket, recipientId) => {
  await createNotification({
    recipient: recipientId,
    type: 'sla_breach',
    title: '🚨 SLA Breached',
    message: `Ticket ${ticket.ticketId} has breached its SLA deadline.`,
    relatedEntity: { type: 'Ticket', id: ticket._id },
    link: `/tickets/${ticket._id}`,
  });
};

const notifyTicketResolved = async (ticket, requesterId) => {
  await createNotification({
    recipient: requesterId,
    type: 'ticket_resolved',
    title: 'Ticket Resolved',
    message: `Your ticket ${ticket.ticketId}: "${ticket.title}" has been resolved. Please confirm or reopen if needed.`,
    relatedEntity: { type: 'Ticket', id: ticket._id },
    link: `/tickets/${ticket._id}`,
  });
};

const notifyAssetAssigned = async (asset, userId) => {
  await createNotification({
    recipient: userId,
    type: 'asset_assigned',
    title: 'Asset Assigned to You',
    message: `Asset ${asset.assetId}: "${asset.name}" has been assigned to you.`,
    relatedEntity: { type: 'Asset', id: asset._id },
    link: `/assets/${asset._id}`,
  });
};

module.exports = {
  createNotification,
  notifyTicketAssigned,
  notifyStatusChanged,
  notifyNewComment,
  notifySLAWarning,
  notifySLABreach,
  notifyTicketResolved,
  notifyAssetAssigned,
};
