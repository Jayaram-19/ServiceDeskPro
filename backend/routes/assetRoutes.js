const express = require('express');
const router = express.Router();
const { getAssets, createAsset, getAssetById, updateAsset, deleteAsset } = require('../controllers/assetController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/', getAssets);
router.post('/', authorize('admin', 'asset_manager'), createAsset);
router.get('/:id', getAssetById);
router.patch('/:id', authorize('admin', 'asset_manager'), updateAsset);
router.delete('/:id', authorize('admin'), deleteAsset);

module.exports = router;
