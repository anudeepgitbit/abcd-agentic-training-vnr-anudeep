const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Classroom = require('../models/Classroom');
const RecentActivity = require('../models/RecentActivity');
const { cloudinary } = require('../config/cloudinary');

const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      classroomId,
      dueDate,
      points,
      difficulty,
      questions,
      timeLimit,
      allowLateSubmissions
    } = req.body;
    
    const teacherId = req.user._id;

    // Validate classroom ownership
    const classroom = await Classroom.findOne({
      _id: classroomId,
      teacher: teacherId
    });

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found or access denied'
      });
    }

    // Handle file attachments if any
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
        cloudinaryPublicId: file.filename
      }));
    }

    // Parse quiz data if provided
    let parsedQuestions = questions || [];
    if (req.body.quizData) {
      try {
        const quizData = JSON.parse(req.body.quizData);
        // If quizData contains structured questions, use them
        if (quizData.questions && Array.isArray(quizData.questions)) {
          parsedQuestions = quizData.questions;
        }
        // Store the raw quiz content for display
        if (quizData.quiz) {
          // You can store this in description or a separate field
          if (!description) {
            description = quizData.quiz;
          }
        }
      } catch (error) {
        console.error('Error parsing quiz data:', error);
      }
    }

    const assignment = new Assignment({
      title,
      description,
      subject, // Required field
      grade: classroom.grade, // Get grade from classroom
      type: req.body.type || 'assignment', // Required field
      teacher: teacherId,
      classroom: classroomId,
      dueDate: new Date(dueDate),
      totalPoints: points || 100,
      questions: parsedQuestions,
      timeLimit: timeLimit ? parseInt(timeLimit) : null,
      lateSubmissionAllowed: allowLateSubmissions !== false,
      attachments,
      status: 'active'
    });

    await assignment.save();

    // Create recent activity (optional - don't fail if it errors)
    try {
      await RecentActivity.createActivity({
        teacherId,
        type: 'assignment_created',
        title: 'New assignment created',
        description: `Created "${title}" for ${classroom.name}`,
        relatedId: assignment._id,
        relatedModel: 'Assignment',
        metadata: {
          subject,
          classroomId,
          dueDate,
          points
        }
      });
    } catch (activityError) {
      console.warn('Failed to create recent activity:', activityError);
    }

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    
    // Clean up uploaded files if assignment creation failed
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await cloudinary.uploader.destroy(file.filename);
        } catch (cleanupError) {
          console.error('File cleanup error:', cleanupError);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create assignment'
    });
  }
};

const getAssignments = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { page = 1, limit = 10, classroomId, status, subject } = req.query;

    const filter = { teacher: teacherId };
    if (classroomId) filter.classroom = classroomId;
    if (status) filter.status = status;
    if (subject) filter.subject = subject;

    const assignments = await Assignment.find(filter)
      .populate('classroom', 'name code')
      .populate('submissions')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add submission statistics
    const assignmentsWithStats = await Promise.all(assignments.map(async assignment => {
      const totalStudents = assignment.classroom?.students?.length || 0;
      const submittedCount = assignment.submissions?.length || 0;
      const pendingCount = Math.max(0, totalStudents - submittedCount);
      
      // Calculate overdue submissions
      const now = new Date();
      const isOverdue = new Date(assignment.dueDate) < now;
      const overdueCount = isOverdue ? pendingCount : 0;
      
      return {
        ...assignment,
        totalStudents,
        submittedCount,
        pendingCount,
        overdueCount,
        isOverdue
      };
    }));

    const total = await Assignment.countDocuments(filter);

    res.json({
      success: true,
      data: assignmentsWithStats
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
};

const getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user._id;

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacher: teacherId
    })
    .populate('classroom', 'name code students')
    .populate({
      path: 'submissions',
      populate: {
        path: 'student',
        select: 'name email avatar studentId'
      }
    })
    .populate({
      path: 'doubts',
      populate: {
        path: 'student',
        select: 'name avatar'
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment'
    });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user._id;
    const updateData = req.body;

    const assignment = await Assignment.findOneAndUpdate(
      { _id: assignmentId, teacher: teacherId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      message: 'Assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment'
    });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user._id;

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacher: teacherId
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Delete associated files from Cloudinary
    if (assignment.attachments && assignment.attachments.length > 0) {
      for (const attachment of assignment.attachments) {
        if (attachment.cloudinaryPublicId) {
          try {
            await cloudinary.uploader.destroy(attachment.cloudinaryPublicId);
          } catch (cloudinaryError) {
            console.error('Cloudinary deletion error:', cloudinaryError);
          }
        }
      }
    }

    // Delete submissions and their files
    const submissions = await Submission.find({ assignment: assignmentId });
    for (const submission of submissions) {
      if (submission.attachments && submission.attachments.length > 0) {
        for (const attachment of submission.attachments) {
          if (attachment.cloudinaryPublicId) {
            try {
              await cloudinary.uploader.destroy(attachment.cloudinaryPublicId);
            } catch (error) {
              console.error('Submission file cleanup error:', error);
            }
          }
        }
      }
    }

    // Delete submissions
    await Submission.deleteMany({ assignment: assignmentId });

    // Delete assignment
    await Assignment.findByIdAndDelete(assignmentId);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment'
    });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const teacherId = req.user._id;
    const { page = 1, limit = 20, status } = req.query;

    // Verify assignment ownership
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacher: teacherId
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const filter = { assignment: assignmentId };
    if (status) filter.status = status;

    const submissions = await Submission.find(filter)
      .populate('student', 'name email avatar studentId')
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Submission.countDocuments(filter);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions'
    });
  }
};

const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback, status } = req.body;
    const teacherId = req.user._id;

    // Verify submission belongs to teacher's assignment
    const submission = await Submission.findById(submissionId)
      .populate('assignment', 'teacher title');

    if (!submission || submission.assignment.teacher.toString() !== teacherId.toString()) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found or access denied'
      });
    }

    // Update submission
    submission.score = score;
    submission.feedback = feedback;
    submission.status = status || 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = teacherId;

    await submission.save();

    // Create recent activity (optional - don't fail if it errors)
    try {
      await RecentActivity.createActivity({
        teacherId,
        type: 'assignment_graded',
        title: 'Assignment graded',
        description: `Graded submission for "${submission.assignment.title}"`,
        relatedId: submission.assignment._id,
        relatedModel: 'Assignment',
        metadata: {
          submissionId,
          score,
          studentId: submission.student
        }
      });
    } catch (activityError) {
      console.warn('Failed to create recent activity:', activityError);
    }

    res.json({
      success: true,
      message: 'Submission graded successfully',
      data: submission
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to grade submission'
    });
  }
};

const getStudentAssignments = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { status, subject } = req.query;

    // Build filter for student's classrooms
    const filter = {
      classroom: { $in: req.user.classrooms || [] },
      status: 'active',
      isActive: true
    };

    if (subject) {
      filter.subject = new RegExp(subject, 'i');
    }

    const assignments = await Assignment.find(filter)
      .populate('classroom', 'name')
      .populate('teacher', 'name')
      .sort({ dueDate: 1 })
      .lean();

    // Get student's submissions for these assignments
    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
      student: studentId
    }).lean();

    // Create submission map for quick lookup
    const submissionMap = {};
    submissions.forEach(sub => {
      submissionMap[sub.assignment.toString()] = sub;
    });

    // Add submission status to each assignment
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = submissionMap[assignment._id.toString()];
      const now = new Date();
      const dueDate = new Date(assignment.dueDate);
      
      let assignmentStatus = 'pending';
      if (submission) {
        assignmentStatus = submission.status || 'submitted';
      } else if (dueDate < now) {
        assignmentStatus = 'overdue';
      }

      return {
        ...assignment,
        submissionStatus: assignmentStatus,
        submission: submission || null,
        isOverdue: dueDate < now && !submission,
        timeRemaining: dueDate > now ? dueDate - now : 0
      };
    });

    // Filter by status if requested
    let filteredAssignments = assignmentsWithStatus;
    if (status) {
      filteredAssignments = assignmentsWithStatus.filter(a => a.submissionStatus === status);
    }

    res.json({
      success: true,
      data: filteredAssignments
    });
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user._id;
    const { content, answers } = req.body;

    // Check if assignment exists and is available
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check if student is in the assignment's classroom
    if (!req.user.classrooms.includes(assignment.classroom.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Assignment already submitted'
      });
    }

    // Handle file attachments if any
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
        cloudinaryPublicId: file.filename
      }));
    }

    // Create submission
    const submission = new Submission({
      assignment: assignmentId,
      student: studentId,
      content: content || '',
      answers: answers || [],
      attachments,
      submittedAt: new Date(),
      status: 'submitted'
    });

    await submission.save();

    // Update assignment's submissions array
    await Assignment.findByIdAndUpdate(assignmentId, {
      $push: { submissions: submission._id }
    });

    // Update student stats
    await req.user.constructor.findByIdAndUpdate(studentId, {
      $inc: { 
        'stats.completedAssignments': 1,
        'stats.totalPoints': assignment.totalPoints || 0
      },
      $push: { submissions: submission._id }
    });

    res.status(201).json({
      success: true,
      message: '🎉 Assignment submitted successfully! Great job!',
      data: submission
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    
    // Clean up uploaded files if submission failed
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          await cloudinary.uploader.destroy(file.filename);
        } catch (cleanupError) {
          console.error('File cleanup error:', cleanupError);
        }
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit assignment'
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  gradeSubmission,
  getStudentAssignments,
  submitAssignment
};
