const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'replies.authorType'
  },
  authorType: {
    type: String,
    required: true,
    enum: ['Student', 'Teacher']
  },
  
  // Reply metadata
  isAnswer: { type: Boolean, default: false }, // Marked as the answer by teacher
  isHelpful: { type: Boolean, default: false },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  
  // Voting tracking
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'replies.votes.userType'
    },
    userType: {
      type: String,
      enum: ['Student', 'Teacher']
    },
    vote: {
      type: String,
      enum: ['up', 'down']
    },
    votedAt: { type: Date, default: Date.now }
  }],
  
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    url: String
  }],
  
  // Status
  isEdited: { type: Boolean, default: false },
  editedAt: Date,
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
}, {
  timestamps: true
});

const doubtSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  
  // Context
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Question Context (if related to specific question)
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Optional, for assignment-specific questions
  },
  questionNumber: Number,
  
  // Categorization
  category: {
    type: String,
    enum: ['concept', 'procedure', 'clarification', 'technical', 'general'],
    default: 'general'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  topics: [String],
  
  // Priority and Urgency
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status
  status: {
    type: String,
    enum: ['open', 'answered', 'resolved', 'closed'],
    default: 'open'
  },
  
  // Visibility
  isPublic: { type: Boolean, default: true }, // Visible to all students in classroom
  isAnonymous: { type: Boolean, default: false }, // Hide student identity
  
  // Replies and Answers
  replies: [replySchema],
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // Points to reply ID that's marked as answer
  },
  
  // Interaction Metrics
  views: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  
  // Voting tracking
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'votes.userType'
    },
    userType: {
      type: String,
      enum: ['Student', 'Teacher']
    },
    vote: {
      type: String,
      enum: ['up', 'down']
    },
    votedAt: { type: Date, default: Date.now }
  }],
  
  // Attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    url: String
  }],
  
  // Teacher Response
  teacherResponse: {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    respondedAt: Date,
    isUrgent: { type: Boolean, default: false }
  },
  
  // AI Assistance
  aiSuggestions: {
    suggestedAnswers: [String],
    relatedTopics: [String],
    similarDoubts: [{
      doubtId: mongoose.Schema.Types.ObjectId,
      similarity: Number // 0-1 score
    }],
    generatedAt: Date
  },
  
  // Tracking
  lastActivity: { type: Date, default: Date.now },
  resolvedAt: Date,
  closedAt: Date,
  
  // Flags and Moderation
  flags: {
    isInappropriate: { type: Boolean, default: false },
    isSpam: { type: Boolean, default: false },
    needsModeration: { type: Boolean, default: false },
    flaggedBy: [{
      user: mongoose.Schema.Types.ObjectId,
      reason: String,
      flaggedAt: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true
});

// Indexes for performance
doubtSchema.index({ assignment: 1 });
doubtSchema.index({ classroom: 1 });
doubtSchema.index({ student: 1 });
doubtSchema.index({ status: 1 });
doubtSchema.index({ priority: 1 });
doubtSchema.index({ subject: 1 });
doubtSchema.index({ lastActivity: -1 });
doubtSchema.index({ createdAt: -1 });

// Update last activity on save
doubtSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Methods
doubtSchema.methods.addReply = function(content, authorId, authorType, isAnswer = false) {
  const reply = {
    content,
    author: authorId,
    authorType,
    isAnswer
  };
  
  this.replies.push(reply);
  
  // If this is marked as answer, update status and accepted answer
  if (isAnswer) {
    this.status = 'answered';
    this.acceptedAnswer = this.replies[this.replies.length - 1]._id;
  }
  
  // Update teacher response if teacher replied
  if (authorType === 'Teacher') {
    this.teacherResponse = {
      teacher: authorId,
      respondedAt: new Date()
    };
  }
  
  return this.save();
};

doubtSchema.methods.markAsResolved = function() {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  return this.save();
};

doubtSchema.methods.close = function() {
  this.status = 'closed';
  this.closedAt = new Date();
  return this.save();
};

doubtSchema.methods.addVote = function(userId, userType, voteType) {
  // Remove existing vote from this user
  this.votes = this.votes.filter(v => v.user.toString() !== userId.toString());
  
  // Add new vote
  this.votes.push({
    user: userId,
    userType,
    vote: voteType
  });
  
  // Recalculate vote counts
  this.upvotes = this.votes.filter(v => v.vote === 'up').length;
  this.downvotes = this.votes.filter(v => v.vote === 'down').length;
  
  return this.save();
};

doubtSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

doubtSchema.methods.flagAsInappropriate = function(userId, reason) {
  this.flags.isInappropriate = true;
  this.flags.needsModeration = true;
  this.flags.flaggedBy.push({
    user: userId,
    reason
  });
  return this.save();
};

// Virtual for reply count
doubtSchema.virtual('replyCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Virtual for score (upvotes - downvotes)
doubtSchema.virtual('score').get(function() {
  return this.upvotes - this.downvotes;
});

// Virtual for time since last activity
doubtSchema.virtual('timeSinceActivity').get(function() {
  const now = new Date();
  const diffMs = now - this.lastActivity;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays} days ago`;
  if (diffHours > 0) return `${diffHours} hours ago`;
  return 'Recently';
});

module.exports = mongoose.model('Doubt', doubtSchema);
