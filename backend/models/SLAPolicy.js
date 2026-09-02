const mongoose = require('mongoose');

const slaPolicySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    // Response time in minutes (time to first response)
    responseTimeMinutes: { type: Number, required: true },
    // Resolution time in minutes (time to resolve)
    resolutionTimeMinutes: { type: Number, required: true },
    // Business hours configuration
    businessHours: {
      enabled: { type: Boolean, default: false },
      startHour: { type: Number, default: 9 },  // 9 AM
      endHour: { type: Number, default: 18 },    // 6 PM
      workDays: { type: [Number], default: [1, 2, 3, 4, 5] }, // Mon-Fri
      timezone: { type: String, default: 'UTC' },
    },
    // Escalation rules
    escalation: {
      warnAtPercent: { type: Number, default: 80 },    // Warn at 80% SLA consumed
      escalateOnBreach: { type: Boolean, default: true },
      escalateTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

slaPolicySchema.index({ organization: 1, priority: 1 });

module.exports = mongoose.model('SLAPolicy', slaPolicySchema);
