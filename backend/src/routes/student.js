const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getStudentDashboard,
  getStudentAssignments,
  getStudentPerformance,
  getStudentProfile,
  updateStudentProfile,
  getStudentAnnouncements,
  submitAssignment,
  getStudentDoubt,
  createDoubt,
  updateStreak,
  updateStudentStats,
  getDashboardStats
} = require('../controllers/studentController');

// All routes require authentication
router.use(authenticate);

// Dashboard route
router.get('/dashboard', getStudentDashboard);

// Assignments routes
router.get('/assignments', getStudentAssignments);
router.post('/assignments/:id/submit', submitAssignment);

// Performance routes
router.get('/performance', getStudentPerformance);

// Profile routes
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

// Announcements route
router.get('/announcements', getStudentAnnouncements);

// Doubts routes
router.get('/doubts', getStudentDoubt);
router.post('/doubts', createDoubt);

// Stats and streak routes
router.post('/streak', updateStreak);
router.post('/stats/update', updateStudentStats);
router.get('/stats/dashboard', getDashboardStats);

module.exports = router;
