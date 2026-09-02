const express = require('express');
const router = express.Router();
const { getArticles, createArticle, getArticleById, updateArticle, deleteArticle, voteArticle } = require('../controllers/knowledgeController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/', getArticles);
router.post('/', authorize('admin', 'manager', 'technician'), createArticle);
router.get('/:id', getArticleById);
router.patch('/:id', authorize('admin', 'manager', 'technician'), updateArticle);
router.delete('/:id', authorize('admin', 'manager'), deleteArticle);
router.post('/:id/vote', voteArticle);

module.exports = router;
