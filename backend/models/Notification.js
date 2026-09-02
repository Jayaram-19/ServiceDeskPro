const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'ticket_assigned', 'ticket_reassigned', 'ticket_status_changed',
        'ticket_resolved', 'ticket_reopened', 'ticket_cancelled',
        'new_comment', 'sla_warning', 'sla_breach', 'sla_escalated',
        'asset_assigned', 'asset_unassigned', 'warranty_expiring',
        'ticket_created', 'ticket_closed',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    // Reference to the related entity
    relatedEntity: {
      type: { type: String, enum: ['Ticket', 'Asset', 'User'] },
      id: { type: mongoose.Schema.Types.ObjectId },
    },
    link: String, // Frontend link to navigate to
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
