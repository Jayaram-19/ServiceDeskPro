const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    domain: { type: String, trim: true, lowercase: true },
    logo: { type: String },
    settings: {
      ticketPrefix: { type: String, default: 'TKT' },
      allowEmployeeReopening: { type: Boolean, default: true },
      autoCloseAfterDays: { type: Number, default: 7 },
      requireResolutionNote: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
