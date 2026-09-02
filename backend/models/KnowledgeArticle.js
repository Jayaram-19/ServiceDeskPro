const mongoose = require('mongoose');

const knowledgeArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    problemDescription: { type: String, required: true },
    symptoms: [String],
    solution: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tags: [String],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft',
    },
    views: { type: Number, default: 0 },
    helpfulVotes: { type: Number, default: 0 },
    notHelpfulVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Full-text search index
knowledgeArticleSchema.index({ title: 'text', problemDescription: 'text', symptoms: 'text', tags: 'text' });
knowledgeArticleSchema.index({ organization: 1, status: 1 });
knowledgeArticleSchema.index({ category: 1 });

module.exports = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
