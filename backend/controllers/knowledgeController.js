const KnowledgeArticle = require('../models/KnowledgeArticle');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');

// GET /api/knowledge
const getArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const { organization, role } = req.user;

    let query = { organization };
    // Non-admins/managers see only published
    if (!['admin', 'manager', 'technician'].includes(role)) query.status = 'Published';
    else if (status) query.status = status;

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const total = await KnowledgeArticle.countDocuments(query);
    const articles = await KnowledgeArticle.find(query, search ? { score: { $meta: 'textScore' } } : {})
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, articles, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// POST /api/knowledge
const createArticle = async (req, res, next) => {
  try {
    const { _id: userId, organization } = req.user;
    const article = await KnowledgeArticle.create({ ...req.body, author: userId, organization });
    return successResponse(res, { article }, 'Article created', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/knowledge/:id
const getArticleById = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const article = await KnowledgeArticle.findOne({ _id: req.params.id, organization })
      .populate('author', 'name email avatar')
      .populate('category', 'name');

    if (!article) return errorResponse(res, 'Article not found', 404);

    // Increment views
    article.views += 1;
    await article.save();

    return successResponse(res, { article });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/knowledge/:id
const updateArticle = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const article = await KnowledgeArticle.findOneAndUpdate(
      { _id: req.params.id, organization },
      req.body,
      { new: true, runValidators: true }
    );
    if (!article) return errorResponse(res, 'Article not found', 404);
    return successResponse(res, { article }, 'Article updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/knowledge/:id
const deleteArticle = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const article = await KnowledgeArticle.findOneAndDelete({ _id: req.params.id, organization });
    if (!article) return errorResponse(res, 'Article not found', 404);
    return successResponse(res, {}, 'Article deleted');
  } catch (err) {
    next(err);
  }
};

// POST /api/knowledge/:id/vote
const voteArticle = async (req, res, next) => {
  try {
    const { helpful } = req.body; // true or false
    const { organization } = req.user;
    const article = await KnowledgeArticle.findOne({ _id: req.params.id, organization });
    if (!article) return errorResponse(res, 'Article not found', 404);

    if (helpful) article.helpfulVotes += 1;
    else article.notHelpfulVotes += 1;
    await article.save();

    return successResponse(res, { article }, 'Vote recorded');
  } catch (err) {
    next(err);
  }
};

module.exports = { getArticles, createArticle, getArticleById, updateArticle, deleteArticle, voteArticle };
