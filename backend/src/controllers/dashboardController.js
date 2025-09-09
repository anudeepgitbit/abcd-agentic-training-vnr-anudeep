const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Classroom = require('../models/Classroom');
const Assignment = require('../models/Assignment');
const Material = require('../models/Material');
const RecentActivity = require('../models/RecentActivity');

const getDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get teacher's classrooms
    const classrooms = await Classroom.find({ teacher: teacherId });
    const classroomIds = classrooms.map(c => c._id);

    // Calculate statistics
    const stats = {
      activeClassrooms: classrooms.length,
      totalStudents: 0,
      assignmentsCreated: 0,
      materialsUploaded: 0
    };

    // Count total students across all classrooms
    for (const classroom of classrooms) {
      stats.totalStudents += classroom.students.length;
    }

    // Count assignments created by teacher
    stats.assignmentsCreated = await Assignment.countDocuments({ 
      teacher: teacherId 
    });

    // Count materials uploaded by teacher
    stats.materialsUploaded = await Material.countDocuments({ 
      teacher: teacherId 
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    const activities = await RecentActivity.find({ teacherId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('relatedId', 'title name')
      .lean();

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
};

const getTeacherOverview = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get comprehensive teacher data
    const teacher = await Teacher.findById(teacherId)
      .select('-password')
      .lean();

    const classrooms = await Classroom.find({ teacher: teacherId })
      .populate('students', 'name email avatar')
      .lean();

    const assignments = await Assignment.find({ teacher: teacherId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const materials = await Material.find({ teacher: teacherId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentActivity = await RecentActivity.find({ teacherId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('relatedId', 'title name')
      .lean();

    // Calculate performance metrics
    const totalStudents = classrooms.reduce((sum, classroom) => sum + classroom.students.length, 0);
    const totalAssignments = await Assignment.countDocuments({ teacher: teacherId });
    const totalMaterials = await Material.countDocuments({ teacher: teacherId });

    res.json({
      success: true,
      data: {
        teacher,
        stats: {
          activeClassrooms: classrooms.length,
          totalStudents,
          assignmentsCreated: totalAssignments,
          materialsUploaded: totalMaterials
        },
        classrooms,
        recentAssignments: assignments,
        recentMaterials: materials,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Teacher overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch teacher overview'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getTeacherOverview
};
