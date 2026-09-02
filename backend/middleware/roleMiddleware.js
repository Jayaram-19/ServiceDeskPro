const { errorResponse } = require('../utils/apiResponse');

/**
 * Authorize by role(s).
 * Usage: authorize('admin', 'manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return errorResponse(res, 'Not authenticated', 401);
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Forbidden: insufficient permissions', 403);
    }
    next();
  };
};

/**
 * Authorize by department (user must belong to the specified department, or be admin/manager).
 */
const authorizeDepartment = (paramField = 'departmentId') => {
  return (req, res, next) => {
    const { role, department } = req.user;
    if (role === 'admin' || role === 'manager') return next();
    const targetDept = req.params[paramField] || req.body.department;
    if (department && department.toString() === targetDept?.toString()) return next();
    return errorResponse(res, 'Forbidden: department mismatch', 403);
  };
};

module.exports = { authorize, authorizeDepartment };
