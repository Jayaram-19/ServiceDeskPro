const mongoose = require('mongoose');
const crypto = require('crypto');

const maintenanceRecordSchema = new mongoose.Schema({
  type: { type: String, enum: ['Repair', 'Upgrade', 'Maintenance', 'Replacement'], required: true },
  description: String,
  performedBy: String,
  cost: Number,
  date: { type: Date, default: Date.now },
  nextMaintenanceDate: Date,
  notes: String,
});

const assetHistorySchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  from: String,
  to: String,
  note: String,
  timestamp: { type: Date, default: Date.now },
});

const assetSchema = new mongoose.Schema(
  {
    assetId: { type: String, unique: true, default: () => `AST-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}` },
    name: { type: String, required: true, trim: true },
    assetType: {
      type: String,
      enum: ['Hardware', 'Software', 'Network', 'Peripheral', 'Other'],
      required: true,
    },
    category: String, // e.g., Laptop, Desktop, Printer, License
    make: String,
    model: String,
    serialNumber: { type: String, trim: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Purchase info
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    purchaseDate: Date,
    purchaseCost: Number,
    invoiceNumber: String,

    // Warranty
    warrantyExpiresAt: Date,
    warrantyProvider: String,
    warrantyNotes: String,

    // Lifecycle
    status: {
      type: String,
      enum: ['Procured', 'Available', 'Assigned', 'Under Repair', 'Retired', 'Disposed'],
      default: 'Available',
    },

    // For software assets
    licenseKey: String,
    licenseExpiresAt: Date,
    licenseSeats: Number,

    // Maintenance
    maintenanceHistory: [maintenanceRecordSchema],

    // History
    history: [assetHistorySchema],

    notes: String,
    tags: [String],
  },
  { timestamps: true }
);

assetSchema.index({ organization: 1, status: 1 });
assetSchema.index({ assignedTo: 1 });
assetSchema.index({ serialNumber: 1 });
assetSchema.index({ warrantyExpiresAt: 1 });

module.exports = mongoose.model('Asset', assetSchema);
