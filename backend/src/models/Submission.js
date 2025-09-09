const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  questionType: {
    type: String,
    required: true,
    enum: ['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blank', 'matching']
  },
  
  // Student's Answer
  answer: mongoose.Schema.Types.Mixed, // Can be string, array, or object depending on question type
  selectedOption: String, // For MCQ questions
  
  // Scoring
  points: { type: Number, default: 0 },
  maxPoints: { type: Number, required: true },
  isCorrect: { type: Boolean, default: false },
  
  // Timing
  timeSpent: { type: Number, default: 0 }, // in seconds
  answeredAt: { type: Date, default: Date.now },
  
  // Manual Grading
  manualGrade: {
    points: Number,
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    gradedAt: Date
  }
});

const submissionSchema = new mongoose.Schema({
  // Basic Information
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  
  // Submission Details
  answers: [answerSchema],
  
  // Scoring
  score: { type: Number, default: 0 },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, default: 0 },
  grade: String, // Letter grade (A, B, C, etc.)
  
  // Status and Timing
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded', 'returned'],
    default: 'draft'
  },
  attemptNumber: { type: Number, default: 1 },
  
  // Timing Information
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  timeSpent: { type: Number, default: 0 }, // total time in seconds
  isLate: { type: Boolean, default: false },
  latePenaltyApplied: { type: Number, default: 0 }, // percentage deducted
  
  // AI Performance Report
  aiReport: {
    overallPerformance: {
      type: String,
      enum: ['excellent', 'good', 'average', 'needs_improvement', 'poor']
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    
    // Subject-wise Analysis
    subjectAnalysis: [{
      subject: String,
      score: Number,
      performance: String,
      insights: [String]
    }],
    
    // Difficulty Analysis
    difficultyAnalysis: {
      easy: { attempted: Number, correct: Number, percentage: Number },
      medium: { attempted: Number, correct: Number, percentage: Number },
      hard: { attempted: Number, correct: Number, percentage: Number }
    },
    
    // Time Analysis
    timeAnalysis: {
      totalTime: Number,
      averageTimePerQuestion: Number,
      timeEfficiency: String, // 'efficient', 'average', 'slow'
      questionsRushed: [mongoose.Schema.Types.ObjectId], // questions answered too quickly
      questionsStuck: [mongoose.Schema.Types.ObjectId] // questions that took too long
    },
    
    // Learning Insights
    learningInsights: {
      conceptsUnderstood: [String],
      conceptsToReview: [String],
      studyPlan: [String],
      nextSteps: [String]
    },
    
    // Comparison with Peers
    peerComparison: {
      classAverage: Number,
      rankInClass: Number,
      percentile: Number,
      betterThanPeers: Number // percentage of peers scored lower
    },
    
    // AI Generation Info
    generatedAt: { type: Date, default: Date.now },
    aiModel: String,
    confidence: { type: Number, min: 0, max: 1 }
  },
  
  // Teacher Feedback
  teacherFeedback: {
    overallFeedback: String,
    specificFeedback: [{
      questionId: mongoose.Schema.Types.ObjectId,
      feedback: String
    }],
    suggestions: [String],
    feedbackBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    feedbackAt: Date
  },
  
  // Cheating Detection
  cheatingFlags: {
    suspiciousActivity: { type: Boolean, default: false },
    flags: [String], // 'tab_switching', 'copy_paste', 'unusual_timing', etc.
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    }
  },
  
  // Files and Attachments (for assignment submissions)
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for performance
submissionSchema.index({ assignment: 1, student: 1 });
submissionSchema.index({ student: 1 });
submissionSchema.index({ classroom: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ submittedAt: -1 });
submissionSchema.index({ score: -1 });

// Calculate score and percentage before saving
submissionSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    this.score = this.answers.reduce((total, answer) => total + (answer.points || 0), 0);
    this.percentage = this.maxScore > 0 ? Math.round((this.score / this.maxScore) * 100) : 0;
    
    // Apply late penalty if applicable
    if (this.isLate && this.latePenaltyApplied > 0) {
      const penalty = (this.latePenaltyApplied / 100) * this.score;
      this.score = Math.max(0, this.score - penalty);
      this.percentage = this.maxScore > 0 ? Math.round((this.score / this.maxScore) * 100) : 0;
    }
    
    // Assign letter grade
    this.grade = this.getLetterGrade();
  }
  next();
});

// Methods
submissionSchema.methods.submit = function() {
  this.status = 'submitted';
  this.submittedAt = new Date();
  
  // Check if late
  if (this.assignment && this.assignment.dueDate && this.submittedAt > this.assignment.dueDate) {
    this.isLate = true;
  }
  
  return this.save();
};

submissionSchema.methods.getLetterGrade = function() {
  const percentage = this.percentage;
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

submissionSchema.methods.addAnswer = function(questionId, answer, questionType, maxPoints) {
  const existingAnswer = this.answers.find(a => a.questionId.toString() === questionId.toString());
  
  if (existingAnswer) {
    existingAnswer.answer = answer;
    existingAnswer.answeredAt = new Date();
  } else {
    this.answers.push({
      questionId,
      questionType,
      answer,
      maxPoints
    });
  }
  
  return this.save();
};

submissionSchema.methods.generateAIReport = async function(reportData) {
  this.aiReport = {
    ...reportData,
    generatedAt: new Date()
  };
  return this.save();
};

submissionSchema.methods.addTeacherFeedback = function(feedback, teacherId) {
  this.teacherFeedback = {
    ...feedback,
    feedbackBy: teacherId,
    feedbackAt: new Date()
  };
  this.status = 'returned';
  return this.save();
};

// Virtual for time spent in human readable format
submissionSchema.virtual('timeSpentFormatted').get(function() {
  const seconds = this.timeSpent;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
});

// Virtual for performance level
submissionSchema.virtual('performanceLevel').get(function() {
  const percentage = this.percentage;
  if (percentage >= 90) return 'excellent';
  if (percentage >= 80) return 'good';
  if (percentage >= 70) return 'average';
  if (percentage >= 60) return 'needs_improvement';
  return 'poor';
});

module.exports = mongoose.model('Submission', submissionSchema);
