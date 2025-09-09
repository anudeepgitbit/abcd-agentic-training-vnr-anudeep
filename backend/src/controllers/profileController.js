const Teacher = require('../models/Teacher');
const Classroom = require('../models/Classroom');
const Assignment = require('../models/Assignment');
const Material = require('../models/Material');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let user;
    if (userRole === 'teacher') {
      user = await Teacher.findById(userId).select('-password').lean();
      
      // Calculate teacher statistics
      const classrooms = await Classroom.find({ teacher: userId });
      const totalStudents = classrooms.reduce((sum, classroom) => sum + classroom.students.length, 0);
      const totalAssignments = await Assignment.countDocuments({ teacher: userId });
      const totalMaterials = await Material.countDocuments({ teacher: userId });

      user.stats = {
        totalClassrooms: classrooms.length,
        totalStudents,
        totalAssignments,
        totalMaterials
      };
    } else {
      // For students - this would be handled by student controller
      return res.status(400).json({
        success: false,
        message: 'Student profile access not implemented in teacher portal'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const {
      name,
      email,
      phone,
      address,
      department,
      qualification,
      experience,
      specialization,
      bio
    } = req.body;

    if (userRole !== 'teacher') {
      return res.status(400).json({
        success: false,
        message: 'Only teachers can update profile through this endpoint'
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await Teacher.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }

    const updateData = {
      name,
      email,
      phone,
      address,
      department,
      qualification,
      experience,
      specialization,
      bio,
      updatedAt: new Date()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const user = await Teacher.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    let user;
    if (userRole === 'teacher') {
      user = await Teacher.findById(userId);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Student password change not implemented in teacher portal'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const avatarUrl = req.file.path; // Cloudinary URL

    let user;
    if (userRole === 'teacher') {
      user = await Teacher.findByIdAndUpdate(
        userId,
        { 
          avatar: avatarUrl,
          updatedAt: new Date()
        },
        { new: true }
      ).select('-password');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Student avatar upload not implemented in teacher portal'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: avatarUrl
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
};

const getTeacherPerformance = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get teacher's classrooms and their statistics
    const classrooms = await Classroom.find({ teacher: teacherId })
      .populate('students', 'stats')
      .lean();

    const assignments = await Assignment.find({ teacher: teacherId })
      .populate('submissions')
      .lean();

    const materials = await Material.find({ teacher: teacherId }).lean();

    // Calculate performance metrics
    const performance = {
      totalClassrooms: classrooms.length,
      totalStudents: classrooms.reduce((sum, c) => sum + c.students.length, 0),
      totalAssignments: assignments.length,
      totalMaterials: materials.length,
      averageClassSize: classrooms.length > 0 
        ? Math.round(classrooms.reduce((sum, c) => sum + c.students.length, 0) / classrooms.length)
        : 0,
      assignmentCompletionRate: 0,
      averageStudentScore: 0,
      materialDownloads: materials.reduce((sum, m) => sum + (m.downloadCount || 0), 0)
    };

    // Calculate assignment completion rate
    if (assignments.length > 0) {
      const totalPossibleSubmissions = assignments.reduce((sum, a) => {
        const classroom = classrooms.find(c => c._id.toString() === a.classroom?.toString());
        return sum + (classroom ? classroom.students.length : 0);
      }, 0);

      const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0);
      
      if (totalPossibleSubmissions > 0) {
        performance.assignmentCompletionRate = Math.round((totalSubmissions / totalPossibleSubmissions) * 100);
      }
    }

    // Calculate average student score across all classrooms
    const allStudents = classrooms.flatMap(c => c.students);
    const studentsWithScores = allStudents.filter(s => s.stats && s.stats.averageScore);
    
    if (studentsWithScores.length > 0) {
      performance.averageStudentScore = Math.round(
        studentsWithScores.reduce((sum, s) => sum + s.stats.averageScore, 0) / studentsWithScores.length
      );
    }

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Get teacher performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance data'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getTeacherPerformance
};
