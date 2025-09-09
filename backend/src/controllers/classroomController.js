const Classroom = require('../models/Classroom');
const Student = require('../models/Student');
const Assignment = require('../models/Assignment');
const Material = require('../models/Material');
const RecentActivity = require('../models/RecentActivity');
const crypto = require('crypto');

const createClassroom = async (req, res) => {
  try {
    const { name, description, subject, grade } = req.body;
    const teacherId = req.user._id;

    // Generate unique classroom code
    const generateCode = () => {
      return crypto.randomBytes(4).toString('hex').toUpperCase();
    };

    let code = generateCode();
    let codeExists = await Classroom.findOne({ inviteCode: code });
    
    // Ensure code is unique
    while (codeExists) {
      code = generateCode();
      codeExists = await Classroom.findOne({ inviteCode: code });
    }

    const classroom = new Classroom({
      name,
      description,
      subject,
      grade,
      teacher: teacherId,
      inviteCode: code,
      students: [],
      settings: {
        allowStudentQuestions: true,
        autoGrading: false,
        publicLeaderboard: true
      }
    });

    await classroom.save();

    // Create recent activity (optional - don't fail if it errors)
    try {
      await RecentActivity.createActivity({
        teacherId,
        type: 'classroom_created',
        title: 'New classroom created',
        description: `Created classroom "${name}" for ${subject}`,
        relatedId: classroom._id,
        relatedModel: 'Classroom',
        metadata: {
          subject,
          grade,
          code
        }
      });
    } catch (activityError) {
      console.warn('Failed to create recent activity:', activityError);
    }

    res.status(201).json({
      success: true,
      message: 'Classroom created successfully',
      data: classroom
    });
  } catch (error) {
    console.error('Create classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create classroom'
    });
  }
};

const getClassrooms = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const classrooms = await Classroom.find({ teacher: teacherId })
      .populate('students', 'name email avatar studentId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add statistics for each classroom
    const classroomsWithStats = await Promise.all(
      classrooms.map(async (classroom) => {
        const assignmentCount = await Assignment.countDocuments({
          classroom: classroom._id
        });
        
        const materialCount = await Material.countDocuments({
          classroom: classroom._id
        });

        return {
          ...classroom,
          stats: {
            studentCount: classroom.students.length,
            assignmentCount,
            materialCount
          }
        };
      })
    );

    const total = await Classroom.countDocuments({ teacher: teacherId });

    res.json({
      success: true,
      data: classroomsWithStats
    });
  } catch (error) {
    console.error('Get classrooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classrooms'
    });
  }
};

const getClassroomById = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const teacherId = req.user._id;

    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacher: teacherId
    })
    .populate('students', 'name email avatar studentId grade stats')
    .populate('teacher', 'name email department')
    .lean();

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    // Get classroom assignments and materials
    const assignments = await Assignment.find({ classroom: classroomId })
      .select('title subject dueDate status points')
      .sort({ createdAt: -1 })
      .lean();

    const materials = await Material.find({ classroom: classroomId })
      .select('title subject fileType createdAt downloadCount')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate classroom statistics
    const stats = {
      totalStudents: classroom.students.length,
      totalAssignments: assignments.length,
      totalMaterials: materials.length,
      averageScore: 0,
      completionRate: 0
    };

    // Calculate average performance if there are students and assignments
    if (classroom.students.length > 0 && assignments.length > 0) {
      const studentScores = classroom.students
        .filter(student => student.stats && student.stats.averageScore)
        .map(student => student.stats.averageScore);
      
      if (studentScores.length > 0) {
        stats.averageScore = Math.round(
          studentScores.reduce((sum, score) => sum + score, 0) / studentScores.length
        );
      }

      const completedAssignments = classroom.students
        .filter(student => student.stats && student.stats.completedAssignments)
        .map(student => student.stats.completedAssignments);
      
      if (completedAssignments.length > 0) {
        const totalPossible = assignments.length * classroom.students.length;
        const totalCompleted = completedAssignments.reduce((sum, count) => sum + count, 0);
        stats.completionRate = Math.round((totalCompleted / totalPossible) * 100);
      }
    }

    res.json({
      success: true,
      data: {
        classroom,
        assignments,
        materials,
        stats
      }
    });
  } catch (error) {
    console.error('Get classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classroom'
    });
  }
};

const updateClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const teacherId = req.user._id;
    const updateData = req.body;

    const classroom = await Classroom.findOneAndUpdate(
      { _id: classroomId, teacher: teacherId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    res.json({
      success: true,
      message: 'Classroom updated successfully',
      data: classroom
    });
  } catch (error) {
    console.error('Update classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update classroom'
    });
  }
};

const deleteClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const teacherId = req.user._id;

    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacher: teacherId
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    // Note: In a production system, you might want to handle this differently
    // For now, we'll prevent deletion if there are students or assignments
    if (classroom.students.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete classroom with enrolled students'
      });
    }

    const assignmentCount = await Assignment.countDocuments({ classroom: classroomId });
    if (assignmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete classroom with existing assignments'
      });
    }

    await Classroom.findByIdAndDelete(classroomId);

    res.json({
      success: true,
      message: 'Classroom deleted successfully'
    });
  } catch (error) {
    console.error('Delete classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete classroom'
    });
  }
};

const removeStudent = async (req, res) => {
  try {
    const { classroomId, studentId } = req.params;
    const teacherId = req.user._id;

    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacher: teacherId
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    // Remove student from classroom
    classroom.students = classroom.students.filter(
      id => id.toString() !== studentId
    );

    await classroom.save();

    res.json({
      success: true,
      message: 'Student removed from classroom successfully'
    });
  } catch (error) {
    console.error('Remove student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove student'
    });
  }
};

const generateInviteCode = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const teacherId = req.user._id;

    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacher: teacherId
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    // Return existing code or generate new one if needed
    res.json({
      success: true,
      data: {
        inviteCode: classroom.inviteCode,
        classroomName: classroom.name,
        subject: classroom.subject
      }
    });
  } catch (error) {
    console.error('Generate invite code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invite code'
    });
  }
};

const assignToClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { assignmentId } = req.body;
    const teacherId = req.user._id;

    // Verify classroom ownership
    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacher: teacherId
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    // Verify assignment ownership and update classroom
    const assignment = await Assignment.findOneAndUpdate(
      { _id: assignmentId, teacher: teacherId },
      { classroom: classroomId },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment assigned to classroom successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Assign to classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign to classroom'
    });
  }
};

module.exports = {
  createClassroom,
  getClassrooms,
  getClassroomById,
  updateClassroom,
  deleteClassroom,
  removeStudent,
  generateInviteCode,
  assignToClassroom
};
