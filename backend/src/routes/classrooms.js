const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { generateUniquePin, validatePin } = require('../utils/pinUtils');
const {
  createClassroom,
  getClassrooms,
  getClassroomById,
  updateClassroom,
  deleteClassroom,
  removeStudent,
  generateInviteCode,
  assignToClassroom
} = require('../controllers/classroomController');

// Most classroom routes require teacher authentication
// Note: /join and /validate-pin routes are handled separately for students

// POST /api/classrooms - Create new classroom
router.post('/', authenticate, requireRole('teacher'), createClassroom);

// GET /api/classrooms - Get all classrooms for teacher
router.get('/', authenticate, requireRole('teacher'), getClassrooms);

// GET /api/classrooms/:classroomId - Get specific classroom
router.get('/:classroomId', authenticate, requireRole('teacher'), getClassroomById);

// GET /api/classrooms/:classroomId/students - Get classroom students
router.get('/:classroomId/students', authenticate, requireRole('teacher'), (req, res) => {
  // Return empty array for now - students will be populated from classroom data
  res.json({ success: true, data: [] });
});

// GET /api/classrooms/:classroomId/assignments - Get classroom assignments
router.get('/:classroomId/assignments', authenticate, requireRole('teacher'), (req, res) => {
  // Return empty array for now - assignments will be populated from classroom data
  res.json({ success: true, data: [] });
});

// GET /api/classrooms/:classroomId/materials - Get classroom materials
router.get('/:classroomId/materials', authenticate, requireRole('teacher'), (req, res) => {
  // Return empty array for now - materials will be populated from classroom data
  res.json({ success: true, data: [] });
});

// GET /api/classrooms/:classroomId/analytics - Get classroom analytics
router.get('/:classroomId/analytics', authenticate, requireRole('teacher'), (req, res) => {
  // Return basic analytics structure
  res.json({ 
    success: true, 
    data: {
      totalStudents: 0,
      totalAssignments: 0,
      averageScore: 0,
      completionRate: 0
    }
  });
});

// PUT /api/classrooms/:classroomId - Update classroom
router.put('/:classroomId', authenticate, requireRole('teacher'), updateClassroom);

// DELETE /api/classrooms/:classroomId - Delete classroom
router.delete('/:classroomId', authenticate, requireRole('teacher'), deleteClassroom);

// DELETE /api/classrooms/:classroomId/students/:studentId - Remove student from classroom
router.delete('/:classroomId/students/:studentId', authenticate, requireRole('teacher'), removeStudent);

// GET /api/classrooms/:classroomId/invite-code - Get classroom invite code
router.get('/:classroomId/invite-code', authenticate, requireRole('teacher'), generateInviteCode);

// POST /api/classrooms/:classroomId/invite-code - Generate new invite code (for frontend compatibility)
router.post('/:classroomId/invite-code', authenticate, requireRole('teacher'), generateInviteCode);

// POST /api/classrooms/:classroomId/assign - Assign assignment to classroom
router.post('/:classroomId/assign', authenticate, requireRole('teacher'), assignToClassroom);

// POST /api/classrooms/:classroomId/generate-pin - Generate new PIN for classroom
router.post('/:classroomId/generate-pin', authenticate, requireRole('teacher'), async (req, res) => {
  try {
    const { classroomId } = req.params;
    const Classroom = require('../models/Classroom');
    
    // Generate unique PIN using shared utility
    const newPin = await generateUniquePin(Classroom);
    
    // Update classroom with new PIN
    const updatedClassroom = await Classroom.findByIdAndUpdate(
      classroomId,
      { 
        pin: newPin,
        pinGeneratedAt: new Date()
      },
      { new: true }
    );
    
    if (updatedClassroom) {
      res.json({
        success: true,
        data: {
          pin: newPin,
          classroomId: classroomId,
          generatedAt: new Date()
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Classroom not found'
      });
    }
  } catch (error) {
    console.error('Error generating PIN:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PIN'
    });
  }
});

// POST /api/classrooms/join - Student joins classroom using PIN
router.post('/join', authenticate, async (req, res) => {
  try {
    const { pin } = req.body;
    const studentId = req.user.id;
    const Classroom = require('../models/Classroom');
    const User = require('../models/User');
    
    // Validate PIN using shared utility
    const validationResult = await validatePin(pin, Classroom);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }
    
    const classroom = validationResult.classroom;
    
    // Check if student is already in classroom
    if (classroom.students.includes(studentId)) {
      return res.json({
        success: true,
        data: {
          classroomName: classroom.name,
          message: 'Already joined this classroom'
        }
      });
    }
    
    // Add student to classroom
    classroom.students.push(studentId);
    await classroom.save();
    
    // Add classroom to student's enrolled classrooms
    await User.findByIdAndUpdate(
      studentId,
      { $addToSet: { enrolledClassrooms: classroom._id } }
    );
    
    res.json({
      success: true,
      data: {
        classroomName: classroom.name,
        classroomId: classroom._id,
        subject: classroom.subject
      }
    });
    
  } catch (error) {
    console.error('Error joining classroom:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join classroom'
    });
  }
});

// POST /api/classrooms/validate-pin - Validate PIN without joining
router.post('/validate-pin', async (req, res) => {
  try {
    const { pin } = req.body;
    const Classroom = require('../models/Classroom');
    
    // Validate PIN using shared utility
    const validationResult = await validatePin(pin, Classroom);
    
    if (validationResult.success) {
      res.json({
        success: true,
        data: {
          classroomName: validationResult.classroom.name,
          subject: validationResult.classroom.subject,
          teacherName: validationResult.classroom.teacher.name
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: validationResult.error
      });
    }
  } catch (error) {
    console.error('Error validating PIN:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate PIN'
    });
  }
});

module.exports = router;
