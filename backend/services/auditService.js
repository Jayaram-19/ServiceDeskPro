const AuditLog = require('../models/AuditLog');

const logAction = async ({
  action,
  performedBy,
  targetModel,
  targetId,
  organization,
  details = {},
  req = null,
}) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetModel,
      targetId,
      organization,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (err) {
    // Audit logging failure should never break main flow
    console.error('[AuditService] Failed to log action:', err.message);
  }
};

module.exports = { logAction };
