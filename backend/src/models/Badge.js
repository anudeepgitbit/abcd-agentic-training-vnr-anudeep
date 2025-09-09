const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Badge Metadata
  type: {
    type: String,
    required: true,
    enum: ['achievement', 'milestone', 'streak', 'participation', 'performance', 'special']
  },
  category: {
    type: String,
    required: true,
    enum: ['academic', 'participation', 'consistency', 'leadership', 'creativity', 'improvement']
  },
  
  // Visual Elements
  icon: {
    type: String,
    required: true // Icon name or URL
  },
  color: {
    type: String,
    default: '#3B82F6' // Hex color code
  },
  
  // Rarity and Value
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    required: true,
    min: 1,
    default: 10
  },
  
  // Requirements
  requirements: {
    // Academic requirements
    minimumScore: Number, // Minimum percentage score
    minimumAssignments: Number, // Number of assignments to complete
    consecutiveDays: Number, // For streak badges
    
    // Participation requirements
    materialsViewed: Number,
    doubtsAnswered: Number,
    helpfulReplies: Number,
    
    // Performance requirements
    averageScore: Number,
    improvementPercentage: Number,
    rankPosition: Number, // Must achieve this rank or better
    
    // Time-based requirements
    timeFrame: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'semester', 'yearly', 'all_time']
    },
    
    // Subject-specific requirements
    subjects: [String], // Must achieve in these subjects
    
    // Custom conditions
    customConditions: [{
      field: String, // Field to check
      operator: String, // 'gte', 'lte', 'eq', 'gt', 'lt'
      value: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Availability
  isActive: { type: Boolean, default: true },
  isHidden: { type: Boolean, default: false }, // Hidden until earned
  
  // Classroom/Global scope
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    default: null // null means global badge
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    default: null // null means system badge
  },
  
  // Statistics
  stats: {
    totalEarned: { type: Number, default: 0 },
    studentsEarned: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Student' 
    }]
  }
}, {
  timestamps: true
});

const milestoneSchema = new mongoose.Schema({
  // Student and Context
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  badge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  },
  
  // Achievement Details
  earnedAt: {
    type: Date,
    default: Date.now
  },
  
  // Context when earned
  triggerEvent: {
    type: String,
    enum: ['assignment_completion', 'score_achievement', 'streak_milestone', 'participation', 'improvement', 'manual_award']
  },
  triggerData: {
    assignmentId: mongoose.Schema.Types.ObjectId,
    score: Number,
    streakDays: Number,
    improvementPercentage: Number,
    customData: mongoose.Schema.Types.Mixed
  },
  
  // Progress tracking
  progress: {
    current: { type: Number, default: 0 },
    required: { type: Number, default: 1 },
    percentage: { type: Number, default: 0 }
  },
  
  // Status
  status: {
    type: String,
    enum: ['in_progress', 'earned', 'expired'],
    default: 'in_progress'
  },
  
  // Notification
  isNotified: { type: Boolean, default: false },
  notifiedAt: Date,
  
  // Validation
  isValid: { type: Boolean, default: true },
  validatedAt: Date,
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }
}, {
  timestamps: true
});

// Indexes for Badge
badgeSchema.index({ type: 1, category: 1 });
badgeSchema.index({ classroom: 1 });
badgeSchema.index({ isActive: 1 });
badgeSchema.index({ rarity: 1 });

// Indexes for Milestone
milestoneSchema.index({ student: 1 });
milestoneSchema.index({ badge: 1 });
milestoneSchema.index({ classroom: 1 });
milestoneSchema.index({ status: 1 });
milestoneSchema.index({ earnedAt: -1 });

// Badge Methods
badgeSchema.methods.checkEligibility = function(studentData) {
  const req = this.requirements;
  
  // Check minimum score
  if (req.minimumScore && studentData.averageScore < req.minimumScore) {
    return false;
  }
  
  // Check minimum assignments
  if (req.minimumAssignments && studentData.completedAssignments < req.minimumAssignments) {
    return false;
  }
  
  // Check streak
  if (req.consecutiveDays && studentData.currentStreak < req.consecutiveDays) {
    return false;
  }
  
  // Check custom conditions
  if (req.customConditions && req.customConditions.length > 0) {
    for (const condition of req.customConditions) {
      const fieldValue = studentData[condition.field];
      const requiredValue = condition.value;
      
      switch (condition.operator) {
        case 'gte':
          if (fieldValue < requiredValue) return false;
          break;
        case 'lte':
          if (fieldValue > requiredValue) return false;
          break;
        case 'eq':
          if (fieldValue !== requiredValue) return false;
          break;
        case 'gt':
          if (fieldValue <= requiredValue) return false;
          break;
        case 'lt':
          if (fieldValue >= requiredValue) return false;
          break;
      }
    }
  }
  
  return true;
};

badgeSchema.methods.awardToStudent = async function(studentId, triggerEvent, triggerData = {}) {
  // Check if student already has this badge
  const existingMilestone = await mongoose.model('Milestone').findOne({
    student: studentId,
    badge: this._id,
    status: 'earned'
  });
  
  if (existingMilestone) {
    return existingMilestone; // Already earned
  }
  
  // Create new milestone
  const milestone = new (mongoose.model('Milestone'))({
    student: studentId,
    badge: this._id,
    classroom: this.classroom,
    triggerEvent,
    triggerData,
    status: 'earned',
    progress: {
      current: 1,
      required: 1,
      percentage: 100
    }
  });
  
  await milestone.save();
  
  // Update badge statistics
  if (!this.stats.studentsEarned.includes(studentId)) {
    this.stats.studentsEarned.push(studentId);
    this.stats.totalEarned += 1;
    await this.save();
  }
  
  return milestone;
};

// Milestone Methods
milestoneSchema.methods.updateProgress = function(current, required) {
  this.progress.current = current;
  this.progress.required = required;
  this.progress.percentage = Math.min(100, Math.round((current / required) * 100));
  
  if (current >= required) {
    this.status = 'earned';
    this.earnedAt = new Date();
  }
  
  return this.save();
};

milestoneSchema.methods.markAsNotified = function() {
  this.isNotified = true;
  this.notifiedAt = new Date();
  return this.save();
};

// Virtual for badge completion status
milestoneSchema.virtual('isCompleted').get(function() {
  return this.status === 'earned';
});

// Create models
const Badge = mongoose.model('Badge', badgeSchema);
const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = { Badge, Milestone };
