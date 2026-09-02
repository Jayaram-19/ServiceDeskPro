const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    contactName: String,
    email: { type: String, trim: true, lowercase: true },
    phone: String,
    website: String,
    address: String,
    services: [String],
    notes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vendorSchema.index({ organization: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
