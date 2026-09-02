const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    icon: { type: String, default: 'tag' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ organization: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
