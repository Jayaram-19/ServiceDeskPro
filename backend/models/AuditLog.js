const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetModel: { type: String }, // 'Ticket', 'User', 'Asset', etc.
    targetId: { type: mongoose.Schema.Types.ObjectId },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    details: { type: mongoose.Schema.Types.Mixed },
    ipAddress: String,
    userAgent: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ organization: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
