const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const SLAPolicy = require('../models/SLAPolicy');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { successResponse, errorResponse } = require('../utils/apiResponse');

router.use(authenticate);

// Categories
router.get('/categories', async (req, res, next) => {
  try {
    const cats = await Category.find({ organization: req.user.organization, isActive: true }).sort({ name: 1 });
    return successResponse(res, { categories: cats });
  } catch (err) { next(err); }
});

router.post('/categories', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const cat = await Category.create({ ...req.body, organization: req.user.organization });
    return successResponse(res, { category: cat }, 'Category created', 201);
  } catch (err) { next(err); }
});

router.patch('/categories/:id', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { organization: ignoredOrganization, ...updates } = req.body;
    const cat = await Category.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      updates, { new: true, runValidators: true }
    );
    if (!cat) return errorResponse(res, 'Category not found', 404);
    return successResponse(res, { category: cat }, 'Category updated');
  } catch (err) { next(err); }
});

router.delete('/categories/:id', authorize('admin'), async (req, res, next) => {
  try {
    await Category.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    return successResponse(res, {}, 'Category deleted');
  } catch (err) { next(err); }
});

// SLA Policies
router.get('/sla-policies', async (req, res, next) => {
  try {
    const policies = await SLAPolicy.find({ organization: req.user.organization }).sort({ priority: 1 });
    return successResponse(res, { policies });
  } catch (err) { next(err); }
});

router.post('/sla-policies', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const policy = await SLAPolicy.create({ ...req.body, organization: req.user.organization });
    return successResponse(res, { policy }, 'SLA policy created', 201);
  } catch (err) { next(err); }
});

router.patch('/sla-policies/:id', authorize('admin', 'manager'), async (req, res, next) => {
  try {
    const { organization: ignoredOrganization, ...updates } = req.body;
    const policy = await SLAPolicy.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      updates, { new: true, runValidators: true }
    );
    if (!policy) return errorResponse(res, 'Policy not found', 404);
    return successResponse(res, { policy }, 'SLA policy updated');
  } catch (err) { next(err); }
});

router.delete('/sla-policies/:id', authorize('admin'), async (req, res, next) => {
  try {
    await SLAPolicy.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    return successResponse(res, {}, 'SLA policy deleted');
  } catch (err) { next(err); }
});

// Audit logs (admin only)
const AuditLog = require('../models/AuditLog');
router.get('/audit-logs', authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const total = await AuditLog.countDocuments({ organization: req.user.organization });
    const logs = await AuditLog.find({ organization: req.user.organization })
      .populate('performedBy', 'name role email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    return res.json({ success: true, data: logs, total });
  } catch (err) { next(err); }
});

// Vendors
const Vendor = require('../models/Vendor');
router.get('/vendors', authorize('admin', 'asset_manager', 'manager'), async (req, res, next) => {
  try {
    const vendors = await Vendor.find({ organization: req.user.organization, isActive: true }).sort({ name: 1 });
    return successResponse(res, { vendors });
  } catch (err) { next(err); }
});

router.post('/vendors', authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const vendor = await Vendor.create({ ...req.body, organization: req.user.organization });
    return successResponse(res, { vendor }, 'Vendor created', 201);
  } catch (err) { next(err); }
});

router.patch('/vendors/:id', authorize('admin', 'asset_manager'), async (req, res, next) => {
  try {
    const { organization: ignoredOrganization, ...updates } = req.body;
    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization },
      updates, { new: true, runValidators: true }
    );
    if (!vendor) return errorResponse(res, 'Vendor not found', 404);
    return successResponse(res, { vendor }, 'Vendor updated');
  } catch (err) { next(err); }
});

module.exports = router;
