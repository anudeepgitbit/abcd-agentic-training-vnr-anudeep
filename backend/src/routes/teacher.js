const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getTeacherDashboard,
  getTeacherClassrooms,
  getTeacherAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getTeacherStudents,
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherAnnouncements,
  createAnnouncement,
  getAssignmentSubmissions,
  gradeSubmission
} = require('../controllers/teacherController');

// All routes require authentication
router.use(authenticate);

// Dashboard route
router.get('/dashboard', getTeacherDashboard);

// Classroom routes
router.get('/classrooms', getTeacherClassrooms);

// Assignment routes
router.get('/assignments', getTeacherAssignments);
router.post('/assignments', createAssignment);
router.put('/assignments/:id', updateAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.get('/assignments/:id/submissions', getAssignmentSubmissions);
router.post('/assignments/:assignmentId/submissions/:submissionId/grade', gradeSubmission);

// Student routes
router.get('/students', getTeacherStudents);

// Profile routes
router.get('/profile', getTeacherProfile);
router.put('/profile', updateTeacherProfile);

// Announcements routes
router.get('/announcements', getTeacherAnnouncements);
router.post('/announcements', createAnnouncement);

module.exports = router;
