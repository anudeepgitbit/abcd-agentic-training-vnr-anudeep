const Doubt = require('../models/Doubt');
const Assignment = require('../models/Assignment');
const RecentActivity = require('../models/RecentActivity');

const getDoubts = async (req, res) => {
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

    const doubts = await Doubt.find(filter)
      .populate('student', 'name avatar studentId')
      .populate('answeredBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Doubt.countDocuments(filter);

    res.json({
      success: true,
      data: {
        doubts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get doubts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doubts'
    });
  }
};

const answerDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { answer } = req.body;
    const teacherId = req.user._id;

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Answer is required'
      });
    }

    // Find doubt and verify teacher has access to it
    const doubt = await Doubt.findById(doubtId)
      .populate('assignment', 'teacher title');

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    if (doubt.assignment.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update doubt with answer
    doubt.answer = answer;
    doubt.answeredBy = teacherId;
    doubt.answeredAt = new Date();
    doubt.status = 'answered';

    await doubt.save();

    // Create recent activity
    await RecentActivity.createActivity({
      teacherId,
      type: 'doubt_answered',
      title: 'Student doubt answered',
      description: `Answered doubt for "${doubt.assignment.title}"`,
      relatedId: doubt.assignment._id,
      relatedModel: 'Assignment',
      metadata: {
        doubtId,
        studentId: doubt.student
      }
    });

    const populatedDoubt = await Doubt.findById(doubtId)
      .populate('student', 'name avatar studentId')
      .populate('answeredBy', 'name')
      .lean();

    res.json({
      success: true,
      message: 'Doubt answered successfully',
      data: populatedDoubt
    });
  } catch (error) {
    console.error('Answer doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to answer doubt'
    });
  }
};

const updateDoubtStatus = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { status } = req.body;
    const teacherId = req.user._id;

    const validStatuses = ['pending', 'answered', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Find doubt and verify teacher has access
    const doubt = await Doubt.findById(doubtId)
      .populate('assignment', 'teacher');

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    if (doubt.assignment.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    doubt.status = status;
    await doubt.save();

    res.json({
      success: true,
      message: 'Doubt status updated successfully',
      data: doubt
    });
  } catch (error) {
    console.error('Update doubt status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doubt status'
    });
  }
};

const deleteDoubt = async (req, res) => {
  try {
    const { doubtId } = req.params;
    const teacherId = req.user._id;

    // Find doubt and verify teacher has access
    const doubt = await Doubt.findById(doubtId)
      .populate('assignment', 'teacher');

    if (!doubt) {
      return res.status(404).json({
        success: false,
        message: 'Doubt not found'
      });
    }

    if (doubt.assignment.teacher.toString() !== teacherId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Doubt.findByIdAndDelete(doubtId);

    res.json({
      success: true,
      message: 'Doubt deleted successfully'
    });
  } catch (error) {
    console.error('Delete doubt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete doubt'
    });
  }
};

module.exports = {
  getDoubts,
  answerDoubt,
  updateDoubtStatus,
  deleteDoubt
};
