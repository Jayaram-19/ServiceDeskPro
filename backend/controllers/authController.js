const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/tokenUtils');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAction } = require('../services/auditService');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, organization, department, phone } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return errorResponse(res, 'Email already registered', 409);

    const user = await User.create({
      name,
      email,
      passwordHash: password, // pre-save hook hashes it
      role: role || 'employee',
      organization,
      department,
      phone,
    });

    await logAction({ action: 'USER_REGISTERED', performedBy: user._id, targetModel: 'User', targetId: user._id, organization, req });

    return successResponse(res, { user }, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return errorResponse(res, 'Invalid credentials', 401);
    if (user.status !== 'Active') return errorResponse(res, 'Account is deactivated', 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse(res, 'Invalid credentials', 401);

    const payload = { id: user._id, role: user.role, organization: user.organization };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token hash
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    await logAction({ action: 'USER_LOGIN', performedBy: user._id, targetModel: 'User', targetId: user._id, organization: user.organization, req });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, { accessToken, user: user.toJSON() }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return errorResponse(res, 'No refresh token', 401);

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) return errorResponse(res, 'Invalid refresh token', 401);
    if (user.status !== 'Active') return errorResponse(res, 'Account is deactivated', 403);

    const payload = { id: user._id, role: user.role, organization: user.organization };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, { accessToken: newAccessToken }, 'Token refreshed');
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }
    next(err);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const decoded = verifyRefreshToken(token); // synchronous, not a Promise
        if (decoded) {
          await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
        }
      } catch (_) {
        // token invalid/expired — still proceed with logout
      }
    }
    res.clearCookie('refreshToken');
    return successResponse(res, {}, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  return successResponse(res, { user: req.user }, 'User fetched');
};

module.exports = { register, login, refreshToken, logout, getMe };
