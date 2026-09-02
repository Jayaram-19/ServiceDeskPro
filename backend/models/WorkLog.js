const mongoose = require('mongoose');

const workLogSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true, maxlength: 2000 },
    timeSpentMinutes: { type: Number, required: true, min: 1 },
    activityType: {
      type: String,
      enum: ['Investigation', 'Configuration', 'Communication', 'Testing', 'Documentation', 'Other'],
      default: 'Investigation',
    },
  },
  { timestamps: true }
);

workLogSchema.index({ ticket: 1 });
workLogSchema.index({ technician: 1 });

module.exports = mongoose.model('WorkLog', workLogSchema);
