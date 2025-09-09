const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getDoubts,
  answerDoubt,
  updateDoubtStatus,
  deleteDoubt
} = require('../controllers/doubtController');

// All doubt routes require teacher authentication
router.use(authenticate);
router.use(requireRole('teacher'));

// GET /api/doubts/assignment/:assignmentId - Get doubts for assignment
router.get('/assignment/:assignmentId', getDoubts);

// POST /api/doubts/:doubtId/answer - Answer a doubt (changed from PUT to POST)
router.post('/:doubtId/answer', answerDoubt);

// PUT /api/doubts/:doubtId/status - Update doubt status
router.put('/:doubtId/status', updateDoubtStatus);

// DELETE /api/doubts/:doubtId - Delete doubt
router.delete('/:doubtId', deleteDoubt);

module.exports = router;
