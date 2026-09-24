const express = require('express');
const router = express.Router();
const {
  getTickets, createTicket, getTicketById, updateTicket,
  assignTicket, resolveTicket, reopenTicket, deleteTicket,
} = require('../controllers/ticketController');
const { addComment, getComments } = require('../controllers/commentController');
const { addWorkLog, getWorkLogs } = require('../controllers/worklogController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.use(authenticate);

router.get('/', getTickets);
router.post('/', upload.array('attachments', 5), createTicket);
router.get('/:id', getTicketById);
router.patch('/:id', updateTicket);
router.delete('/:id', authorize('admin'), deleteTicket);

// Actions
router.post('/:id/assign', authorize('admin', 'manager'), assignTicket);
router.post('/:id/resolve', authorize('admin', 'manager', 'technician'), resolveTicket);
router.post('/:id/reopen', reopenTicket);

// Sub-resources
router.get('/:id/comments', getComments);
router.post('/:id/comments', upload.array('attachments', 3), addComment);
router.get('/:id/worklogs', getWorkLogs);
router.post('/:id/worklogs', authorize('admin', 'manager', 'technician'), addWorkLog);

module.exports = router;
