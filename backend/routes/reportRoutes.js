const express = require('express');
const router = express.Router();
const { ticketReport, assetReport, slaReport } = require('../controllers/reportController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(authenticate);
router.use(authorize('admin', 'manager', 'asset_manager'));

router.get('/tickets', ticketReport);
router.get('/assets', assetReport);
router.get('/sla', slaReport);

module.exports = router;
