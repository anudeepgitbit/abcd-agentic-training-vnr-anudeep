const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getTeacherPerformance
} = require('../controllers/profileController');

// All profile routes require authentication
router.use(authenticate);

// GET /api/profile - Get user profile
router.get('/', getProfile);

// PUT /api/profile - Update profile (teachers only for this implementation)
router.put('/', requireRole('teacher'), updateProfile);

// POST /api/profile/change-password - Change password
router.post('/change-password', changePassword);

// POST /api/profile/avatar - Upload avatar
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// GET /api/profile/performance - Get teacher performance metrics
router.get('/performance', requireRole('teacher'), getTeacherPerformance);

module.exports = router;
