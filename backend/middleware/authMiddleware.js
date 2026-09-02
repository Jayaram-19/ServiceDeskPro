const { verifyAccessToken } = require('../utils/tokenUtils');
const { errorResponse } = require('../utils/apiResponse');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Fetch fresh user data (catches deactivated accounts)
    const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
    if (!user) return errorResponse(res, 'User not found', 401);
    if (user.status !== 'Active') return errorResponse(res, 'Account is deactivated', 403);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    return errorResponse(res, 'Invalid token', 401);
  }
};

module.exports = { authenticate };
