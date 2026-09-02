const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, getTechnicians, getDepartments, createDepartment } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/', authorize('admin', 'manager'), getUsers);
router.get('/technicians', authorize('admin', 'manager'), getTechnicians);
router.get('/departments', getDepartments);
router.post('/departments', authorize('admin'), createDepartment);
router.get('/:id', authorize('admin', 'manager'), getUserById);
router.patch('/:id', authorize('admin', 'manager'), updateUser);

module.exports = router;
