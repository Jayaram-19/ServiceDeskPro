const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  path: String,
});

const commentSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, maxlength: 5000 },
    isInternal: { type: Boolean, default: false }, // internal notes visible only to technicians/managers
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

commentSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
