const mongoose = require('mongoose');
const { TICKET_STATUSES } = require('../utils/ticketStateMachine');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  path: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
});

const historyEntrySchema = new mongoose.Schema({
  action: { type: String, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  note: String,
  timestamp: { type: Date, default: Date.now },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 5000 },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: Object.values(TICKET_STATUSES),
      default: TICKET_STATUSES.OPEN,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // SLA
    slaPolicy: { type: mongoose.Schema.Types.ObjectId, ref: 'SLAPolicy' },
    slaDeadline: { type: Date },
    slaResponseDeadline: { type: Date },
    slaBreached: { type: Boolean, default: false },
    slaResponseBreached: { type: Boolean, default: false },
    slaEscalated: { type: Boolean, default: false },
    firstResponseAt: { type: Date },

    // AI Classification
    aiClassification: {
      category: String,
      priority: String,
      probableIssue: String,
      confidence: Number,
      classifiedAt: Date,
    },

    // Attachments
    attachments: [attachmentSchema],

    // Resolution
    resolution: {
      note: String,
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolvedAt: Date,
    },

    // Tracking
    closedAt: Date,
    reopenedAt: Date,
    cancelledAt: Date,

    // Knowledge articles linked
    linkedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeArticle' }],

    // Activity history (timeline)
    history: [historyEntrySchema],

    // Tags for full-text search
    tags: [String],
  },
  { timestamps: true }
);

// Indexes for common queries
ticketSchema.index({ organization: 1, status: 1 });
ticketSchema.index({ requester: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ slaDeadline: 1, slaBreached: 1 });
ticketSchema.index({ priority: 1, status: 1 });
// ticketId is already indexed via unique:true above
ticketSchema.index({ title: 'text', description: 'text' });

// Auto-generate ticketId
ticketSchema.pre('save', async function (next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments({ organization: this.organization });
    this.ticketId = `TKT-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
