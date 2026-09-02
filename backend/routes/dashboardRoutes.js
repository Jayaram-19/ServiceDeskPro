const express = require('express');
const router = express.Router();
const {
  getManagerDashboard, getTechnicianDashboard,
  getEmployeeDashboard, getAssetDashboard, getAdminDashboard,
} = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/manager', authorize('admin', 'manager'), getManagerDashboard);
router.get('/technician', authorize('admin', 'manager', 'technician'), getTechnicianDashboard);
router.get('/employee', getEmployeeDashboard);
router.get('/assets', authorize('admin', 'manager', 'asset_manager'), getAssetDashboard);
router.get('/admin', authorize('admin'), getAdminDashboard);

module.exports = router;
