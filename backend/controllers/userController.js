const User = require('../models/User');
const Department = require('../models/Department');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/apiResponse');
const { logAction } = require('../services/auditService');

// GET /api/users
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, department, status, search } = req.query;
    const { organization } = req.user;

    let query = { organization };
    if (role) query.role = role;
    if (department) query.department = department;
    if (status) query.status = status;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, users, total, page, limit);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const user = await User.findOne({ _id: req.params.id, organization }).populate('department', 'name');
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, { user });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { _id: actorId, organization, role: actorRole } = req.user;
    const { name, phone, department, role, status, avatar, skills, maxTickets } = req.body;

    const user = await User.findOne({ _id: req.params.id, organization });
    if (!user) return errorResponse(res, 'User not found', 404);

    if (actorRole !== 'admin' && (role !== undefined || status !== undefined)) {
      return errorResponse(res, 'Only administrators can change roles or account status', 403);
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (role) user.role = role;
    if (status) user.status = status;
    if (avatar) user.avatar = avatar;
    if (skills) user.skills = skills;
    if (maxTickets !== undefined) user.maxTickets = maxTickets;

    await user.save();

    await logAction({ action: 'USER_UPDATED', performedBy: actorId, targetModel: 'User', targetId: user._id, organization, details: req.body, req });
    return successResponse(res, { user }, 'User updated');
  } catch (err) {
    next(err);
  }
};

// GET /api/users/technicians — list available technicians for assignment
const getTechnicians = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const technicians = await User.find({
      organization,
      role: { $in: ['technician', 'manager'] },
      status: 'Active',
    }).select('name email avatar role skills maxTickets').sort({ name: 1 });
    return successResponse(res, { technicians });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/departments
const getDepartments = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const departments = await Department.find({ organization, isActive: true })
      .populate('manager', 'name email')
      .sort({ name: 1 });
    return successResponse(res, { departments });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/departments
const createDepartment = async (req, res, next) => {
  try {
    const { organization } = req.user;
    const dept = await Department.create({ ...req.body, organization });
    return successResponse(res, { department: dept }, 'Department created', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers, getUserById, updateUser, getTechnicians, getDepartments, createDepartment };
