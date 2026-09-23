const Asset = require('../models/Asset');
const User = require('../models/User');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { logAction } = require('../services/auditService');
const { notifyAssetAssigned } = require('../services/notificationService');

// GET /api/assets
const getAssets = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, assetType, assignedTo, search, department } = req.query;
    const { organization, role, _id: userId } = req.user;

    let query = { organization };
    if (status) query.status = status;
    if (assetType) query.assetType = assetType;
    if (department) query.department = department;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } },
      { assetId: { $regex: search, $options: 'i' } },
    ];

    // Role-based filtering removed to allow organization-wide visibility
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const total = await Asset.countDocuments(query);
    const assets = await Asset.find(query)
      .populate('assignedTo', 'name email avatar department')
      .populate('department', 'name')
      .populate('vendor', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, assets, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// POST /api/assets
const createAsset = async (req, res, next) => {
  try {
    const { _id: userId, organization } = req.user;
    const asset = await Asset.create({ ...req.body, organization });
    asset.history.push({ action: 'Asset Created', performedBy: userId });
    await asset.save();

    await logAction({ action: 'ASSET_CREATED', performedBy: userId, targetModel: 'Asset', targetId: asset._id, organization, details: { assetId: asset.assetId }, req });
    return successResponse(res, { asset }, 'Asset created', 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/assets/:id
const getAssetById = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const asset = await Asset.findOne({ _id: req.params.id, organization })
      .populate('assignedTo', 'name email avatar department')
      .populate('department', 'name')
      .populate('vendor', 'name email phone website')
      .populate('history.performedBy', 'name role');

    if (!asset) return errorResponse(res, 'Asset not found', 404);
    return successResponse(res, { asset });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/assets/:id
const updateAsset = async (req, res, next) => {
  try {
    const { _id: userId, organization } = req.user;
    const asset = await Asset.findOne({ _id: req.params.id, organization });
    if (!asset) return errorResponse(res, 'Asset not found', 404);

    const { assignedTo, status, maintenanceRecord, ...rest } = req.body;

    // Handle assignment
    if (assignedTo !== undefined) {
      const oldAssignee = asset.assignedTo;
      if (assignedTo) {
        const user = await User.findById(assignedTo);
        if (!user) return errorResponse(res, 'User not found', 404);
        asset.assignedTo = assignedTo;
        asset.status = 'Assigned';
        asset.history.push({ action: 'Assigned', performedBy: userId, from: oldAssignee?.toString(), to: assignedTo });
        await notifyAssetAssigned(asset, assignedTo);
      } else {
        asset.assignedTo = null;
        asset.status = 'Available';
        asset.history.push({ action: 'Unassigned', performedBy: userId, from: oldAssignee?.toString() });
      }
    }

    if (status && status !== asset.status) {
      asset.history.push({ action: 'Status Changed', performedBy: userId, from: asset.status, to: status });
      asset.status = status;
    }

    if (maintenanceRecord) {
      asset.maintenanceHistory.push(maintenanceRecord);
      asset.history.push({ action: 'Maintenance Recorded', performedBy: userId, note: maintenanceRecord.description });
    }

    Object.assign(asset, rest);
    await asset.save();

    await logAction({ action: 'ASSET_UPDATED', performedBy: userId, targetModel: 'Asset', targetId: asset._id, organization, req });
    return successResponse(res, { asset }, 'Asset updated');
  } catch (err) {
    next(err);
  }
};

// DELETE /api/assets/:id
const deleteAsset = async (req, res, next) => {
  try {
    const { organization, _id: userId } = req.user;
    const asset = await Asset.findOneAndDelete({ _id: req.params.id, organization });
    if (!asset) return errorResponse(res, 'Asset not found', 404);
    await logAction({ action: 'ASSET_DELETED', performedBy: userId, targetModel: 'Asset', targetId: req.params.id, organization, req });
    return successResponse(res, {}, 'Asset deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAssets, createAsset, getAssetById, updateAsset, deleteAsset };
