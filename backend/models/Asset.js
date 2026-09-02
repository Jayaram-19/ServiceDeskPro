const mongoose = require('mongoose');

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
    assetId: { type: String, unique: true },
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
// assetId is already indexed via unique:true above

// Auto-generate assetId
assetSchema.pre('save', async function (next) {
  if (!this.assetId) {
    const count = await mongoose.model('Asset').countDocuments({ organization: this.organization });
    this.assetId = `AST-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Asset', assetSchema);
