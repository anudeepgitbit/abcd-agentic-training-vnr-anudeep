const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getDashboardStats,
  getRecentActivity,
  getTeacherOverview
} = require('../controllers/dashboardController');

// All dashboard routes require teacher authentication
router.use(authenticate);
router.use(requireRole('teacher'));

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', getDashboardStats);

// GET /api/dashboard/recent-activity - Get recent activity
router.get('/recent-activity', getRecentActivity);

// GET /api/dashboard/overview - Get complete teacher overview
router.get('/overview', getTeacherOverview);

module.exports = router;
