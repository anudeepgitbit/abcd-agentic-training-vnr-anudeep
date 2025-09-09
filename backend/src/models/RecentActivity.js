const mongoose = require('mongoose');

const recentActivitySchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'assignment_created',
      'assignment_graded', 
      'material_uploaded',
      'student_joined',
      'classroom_created',
      'doubt_answered',
      'quiz_generated'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel'
  },
  relatedModel: {
    type: String,
    enum: ['Assignment', 'Material', 'Classroom', 'Student', 'Doubt']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
recentActivitySchema.index({ teacherId: 1, createdAt: -1 });

// Static method to create activity
recentActivitySchema.statics.createActivity = async function(data) {
  try {
    const activity = new this(data);
    await activity.save();
    
    // Keep only the latest 50 activities per teacher
    const activities = await this.find({ teacherId: data.teacherId })
      .sort({ createdAt: -1 })
      .skip(50);
    
    if (activities.length > 0) {
      const idsToDelete = activities.map(activity => activity._id);
      await this.deleteMany({ _id: { $in: idsToDelete } });
    }
    
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

module.exports = mongoose.model('RecentActivity', recentActivitySchema);
