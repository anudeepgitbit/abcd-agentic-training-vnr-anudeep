const Teacher = require('../models/Teacher');
const { assignmentsData, announcementsData } = require('../data/seedData');

// Get teacher dashboard data
const getTeacherDashboard = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user._id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const dashboardData = {
      teacher: {
        name: teacher.name,
        department: teacher.department,
        avatar: teacher.avatar,
        stats: teacher.stats,
        badges: teacher.badges
      },
      recentAssignments: assignmentsData.slice(0, 4).map(assignment => ({
        ...assignment,
        id: Math.random().toString(36).substr(2, 9),
        submissionsCount: Math.floor(Math.random() * 30) + 10,
        gradedCount: Math.floor(Math.random() * 20) + 5
      })),
      classroomStats: {
        totalStudents: teacher.stats.totalStudents,
        activeAssignments: teacher.stats.totalAssignments,
        averagePerformance: teacher.stats.averageClassPerformance,
        pendingGrading: Math.floor(Math.random() * 15) + 5
      },
      recentActivity: [
        { type: 'submission', message: 'New submission for Math Assignment', time: '2 hours ago' },
        { type: 'question', message: 'Student asked about Chemistry lab', time: '4 hours ago' },
        { type: 'grade', message: 'Graded 5 assignments', time: '1 day ago' }
      ],
      upcomingDeadlines: assignmentsData.map(assignment => ({
        ...assignment,
        id: Math.random().toString(36).substr(2, 9),
        daysLeft: Math.ceil((assignment.dueDate - new Date()) / (1000 * 60 * 60 * 24))
      })).slice(0, 3)
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get teacher classrooms
const getTeacherClassrooms = async (req, res) => {
  try {
    const classrooms = [
      {
        id: '1',
        name: 'Mathematics - Grade 10A',
        subject: 'Mathematics',
        grade: '10th Grade',
        studentsCount: 28,
        averagePerformance: 82.5,
        activeAssignments: 3,
        lastActivity: new Date()
      },
      {
        id: '2',
        name: 'Mathematics - Grade 10B',
        subject: 'Mathematics',
        grade: '10th Grade',
        studentsCount: 25,
        averagePerformance: 78.3,
        activeAssignments: 2,
        lastActivity: new Date()
      },
      {
        id: '3',
        name: 'Advanced Mathematics - Grade 11',
        subject: 'Mathematics',
        grade: '11th Grade',
        studentsCount: 32,
        averagePerformance: 85.7,
        activeAssignments: 4,
        lastActivity: new Date()
      }
    ];

    res.json({ classrooms });
  } catch (error) {
    console.error('Classrooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get teacher assignments
const getTeacherAssignments = async (req, res) => {
  try {
    const { status, subject } = req.query;
    
    let assignments = assignmentsData.map(assignment => ({
      ...assignment,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      submissionsCount: Math.floor(Math.random() * 30) + 10,
      gradedCount: Math.floor(Math.random() * 20) + 5,
      averageScore: Math.floor(Math.random() * 30) + 70
    }));

    // Add more assignments for variety
    const additionalAssignments = [
      {
        id: Math.random().toString(36).substr(2, 9),
        title: 'Trigonometry Problems',
        description: 'Solve trigonometric equations and identities',
        subject: 'Mathematics',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        totalMarks: 80,
        difficulty: 'hard',
        status: 'active',
        createdAt: new Date(),
        submissionsCount: 15,
        gradedCount: 8,
        averageScore: 75
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        title: 'Photosynthesis Lab',
        description: 'Conduct experiments on photosynthesis process',
        subject: 'Science',
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        totalMarks: 60,
        difficulty: 'medium',
        status: 'active',
        createdAt: new Date(),
        submissionsCount: 22,
        gradedCount: 18,
        averageScore: 83
      }
    ];

    assignments = [...assignments, ...additionalAssignments];

    // Filter by status if provided
    if (status) {
      assignments = assignments.filter(assignment => assignment.status === status);
    }

    // Filter by subject if provided
    if (subject) {
      assignments = assignments.filter(assignment => 
        assignment.subject.toLowerCase().includes(subject.toLowerCase())
      );
    }

    res.json({
      assignments,
      summary: {
        total: assignments.length,
        active: assignments.filter(a => a.status === 'active').length,
        draft: assignments.filter(a => a.status === 'draft').length,
        completed: assignments.filter(a => a.status === 'completed').length
      }
    });
  } catch (error) {
    console.error('Teacher assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new assignment
const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, dueDate, totalMarks, difficulty, instructions } = req.body;

    const assignment = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      subject,
      dueDate: new Date(dueDate),
      totalMarks,
      difficulty,
      instructions,
      status: 'active',
      createdAt: new Date(),
      teacherId: req.user._id,
      submissionsCount: 0,
      gradedCount: 0
    };

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Simulate assignment update
    const updatedAssignment = {
      id,
      ...updates,
      updatedAt: new Date()
    };

    res.json({
      message: 'Assignment updated successfully',
      assignment: updatedAssignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    res.json({
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get teacher students
const getTeacherStudents = async (req, res) => {
  try {
    const students = [
      {
        id: '1',
        name: 'Alice Wilson',
        email: 'alice@student.com',
        grade: '10th Grade',
        rollNumber: 'R001',
        averageScore: 87.5,
        attendance: 95,
        lastActive: new Date(),
        status: 'active'
      },
      {
        id: '2',
        name: 'Bob Davis',
        email: 'bob@student.com',
        grade: '10th Grade',
        rollNumber: 'R002',
        averageScore: 76.3,
        attendance: 88,
        lastActive: new Date(),
        status: 'active'
      },
      {
        id: '3',
        name: 'Carol Martinez',
        email: 'carol@student.com',
        grade: '11th Grade',
        rollNumber: 'R003',
        averageScore: 94.2,
        attendance: 98,
        lastActive: new Date(),
        status: 'active'
      }
    ];

    res.json({ students });
  } catch (error) {
    console.error('Teacher students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get teacher profile
const getTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user._id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ teacher });
  } catch (error) {
    console.error('Teacher profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update teacher profile
const updateTeacherProfile = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'address', 'preferences', 'specialization'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const teacher = await Teacher.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      teacher 
    });
  } catch (error) {
    console.error('Teacher profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get teacher announcements
const getTeacherAnnouncements = async (req, res) => {
  try {
    const announcements = announcementsData.map(announcement => ({
      ...announcement,
      id: Math.random().toString(36).substr(2, 9),
      authorId: req.user._id,
      viewsCount: Math.floor(Math.random() * 100) + 20
    }));

    res.json({ announcements });
  } catch (error) {
    console.error('Teacher announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, type } = req.body;

    const announcement = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      priority: priority || 'medium',
      type: type || 'general',
      authorId: req.user._id,
      isActive: true,
      createdAt: new Date(),
      viewsCount: 0
    };

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get assignment submissions
const getAssignmentSubmissions = async (req, res) => {
  try {
    const { id } = req.params;

    const submissions = [
      {
        id: '1',
        assignmentId: id,
        student: { id: '1', name: 'Alice Wilson', rollNumber: 'R001' },
        submittedAt: new Date(),
        status: 'submitted',
        grade: null,
        feedback: null,
        content: 'Assignment solution submitted'
      },
      {
        id: '2',
        assignmentId: id,
        student: { id: '2', name: 'Bob Davis', rollNumber: 'R002' },
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'graded',
        grade: 85,
        feedback: 'Good work, but could improve on problem 3',
        content: 'Assignment solution submitted'
      }
    ];

    res.json({ submissions });
  } catch (error) {
    console.error('Assignment submissions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Grade submission
const gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { grade, feedback } = req.body;

    const gradedSubmission = {
      id: submissionId,
      assignmentId,
      grade,
      feedback,
      gradedAt: new Date(),
      gradedBy: req.user._id,
      status: 'graded'
    };

    res.json({
      message: 'Submission graded successfully',
      submission: gradedSubmission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
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
};
