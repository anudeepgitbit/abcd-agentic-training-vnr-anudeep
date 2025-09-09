const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validatePin } = require('../utils/pinUtils');

// POST /api/student/classrooms/join - Student joins classroom using PIN
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

// POST /api/student/classrooms/validate-pin - Validate PIN without joining
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

// GET /api/student/classrooms - Get student's enrolled classrooms
router.get('/', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    const User = require('../models/User');
    
    const student = await User.findById(studentId).populate({
      path: 'enrolledClassrooms',
      populate: {
        path: 'teacher',
        select: 'name email'
      }
    });
    
    if (student && student.enrolledClassrooms) {
      res.json({
        success: true,
        data: student.enrolledClassrooms
      });
    } else {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Error fetching student classrooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classrooms'
    });
  }
});

module.exports = router;
