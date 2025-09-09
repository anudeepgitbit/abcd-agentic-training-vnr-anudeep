const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blank', 'matching']
  },
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // MCQ Options
  options: [{
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, default: false }
  }],
  
  // Answer Information
  correctAnswer: String, // For non-MCQ questions
  acceptableAnswers: [String], // Multiple acceptable answers
  
  // Question Settings
  points: { type: Number, required: true, min: 1, default: 1 },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeLimit: Number, // in seconds, optional
  
  // Explanation and Hints
  explanation: String,
  hints: [String],
  
  // Media attachments
  attachments: [{
    type: String,
    url: String,
    filename: String
  }],
  
  // Question order
  order: { type: Number, required: true }
});

const assignmentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Assignment Type
  type: {
    type: String,
    required: true,
    enum: ['quiz', 'assignment', 'test', 'homework', 'project']
  },
  
  // Classroom and Teacher
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  
  // Questions
  questions: [questionSchema],
  
  // Scoring and Grading
  totalPoints: { type: Number, required: true, default: 0 },
  passingScore: { type: Number, default: 60 }, // percentage
  gradingType: {
    type: String,
    enum: ['auto', 'manual', 'hybrid'],
    default: 'auto'
  },
  
  // Timing
  timeLimit: Number, // in minutes
  attemptsAllowed: { type: Number, default: 1 },
  
  // Scheduling
  publishedAt: { type: Date, default: Date.now },
  startDate: Date,
  dueDate: Date,
  lateSubmissionAllowed: { type: Boolean, default: true },
  latePenalty: { type: Number, default: 10 }, // percentage deduction
  
  // Settings
  settings: {
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
    showResultsImmediately: { type: Boolean, default: true },
    allowReview: { type: Boolean, default: true },
    showCorrectAnswers: { type: Boolean, default: true },
    preventCheating: { type: Boolean, default: true },
    requireProctoring: { type: Boolean, default: false }
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed', 'archived'],
    default: 'draft'
  },
  isActive: { type: Boolean, default: true },
  
  // Submissions
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  }],
  
  // Doubts/Questions from students
  doubts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doubt'
  }],
  
  // Statistics
  stats: {
    totalSubmissions: { type: Number, default: 0 },
    completedSubmissions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    lowestScore: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 }, // in minutes
    passRate: { type: Number, default: 0 } // percentage
  },
  
  // AI-Generated Content
  aiGenerated: {
    isGenerated: { type: Boolean, default: false },
    generatedAt: Date,
    prompt: String,
    difficulty: String,
    topics: [String]
  },
  
  // Categorization
  subject: {
    type: String,
    required: true,
    trim: true
  },
  topics: [String],
  grade: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
assignmentSchema.index({ classroom: 1 });
assignmentSchema.index({ teacher: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ subject: 1, grade: 1 });
assignmentSchema.index({ publishedAt: -1 });

// Calculate total points before saving
assignmentSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  }
  next();
});

// Update statistics
assignmentSchema.methods.updateStats = function() {
  const submissions = this.submissions || [];
  const completedSubmissions = submissions.filter(s => s.status === 'submitted');
  
  this.stats.totalSubmissions = submissions.length;
  this.stats.completedSubmissions = completedSubmissions.length;
  
  if (completedSubmissions.length > 0) {
    const scores = completedSubmissions.map(s => s.score);
    this.stats.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    this.stats.highestScore = Math.max(...scores);
    this.stats.lowestScore = Math.min(...scores);
    this.stats.passRate = (scores.filter(s => s >= this.passingScore).length / scores.length) * 100;
  }
  
  return this.save();
};

// Methods
assignmentSchema.methods.addSubmission = function(submissionId) {
  if (!this.submissions.includes(submissionId)) {
    this.submissions.push(submissionId);
  }
  return this.save();
};

assignmentSchema.methods.addDoubt = function(doubtId) {
  if (!this.doubts.includes(doubtId)) {
    this.doubts.push(doubtId);
  }
  return this.save();
};

assignmentSchema.methods.isAvailable = function() {
  const now = new Date();
  const startOk = !this.startDate || now >= this.startDate;
  const endOk = !this.dueDate || now <= this.dueDate || this.lateSubmissionAllowed;
  return this.status === 'active' && this.isActive && startOk && endOk;
};

assignmentSchema.methods.isOverdue = function() {
  return this.dueDate && new Date() > this.dueDate;
};

assignmentSchema.methods.getTimeRemaining = function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const timeLeft = this.dueDate - now;
  return timeLeft > 0 ? timeLeft : 0;
};

// Virtual for question count
assignmentSchema.virtual('questionCount').get(function() {
  return this.questions ? this.questions.length : 0;
});

// Virtual for submission rate
assignmentSchema.virtual('submissionRate').get(function() {
  if (this.stats.totalSubmissions === 0) return 0;
  return Math.round((this.stats.completedSubmissions / this.stats.totalSubmissions) * 100);
});

module.exports = mongoose.model('Assignment', assignmentSchema);