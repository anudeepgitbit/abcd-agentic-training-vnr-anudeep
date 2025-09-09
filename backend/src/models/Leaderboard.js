const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Ranking Information
  rank: {
    type: Number,
    required: true,
    min: 1
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // Submission Details
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true
  },
  submittedAt: {
    type: Date,
    required: true
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  
  // Performance Metrics
  correctAnswers: { type: Number, default: 0 },
  totalQuestions: { type: Number, required: true },
  accuracy: { type: Number, default: 0 }, // percentage
  
  // Badges and Achievements for this assignment
  badgesEarned: [{
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    earnedAt: { type: Date, default: Date.now }
  }],
  
  // Special Recognition
  isTopPerformer: { type: Boolean, default: false },
  isMostImproved: { type: Boolean, default: false },
  isFastestCompletion: { type: Boolean, default: false },
  
  // Streak Information
  currentStreak: { type: Number, default: 0 },
  streakAtSubmission: { type: Number, default: 0 }
});

const leaderboardSchema = new mongoose.Schema({
  // Assignment Context
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
    unique: true // One leaderboard per assignment
  },
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
  
  // Leaderboard Entries
  entries: [leaderboardEntrySchema],
  
  // Statistics
  stats: {
    totalParticipants: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    lowestScore: { type: Number, default: 0 },
    medianScore: { type: Number, default: 0 },
    standardDeviation: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 }, // percentage who passed
    averageTime: { type: Number, default: 0 }, // average completion time
    completionRate: { type: Number, default: 0 } // percentage who completed
  },
  
  // Settings
  settings: {
    isVisible: { type: Boolean, default: true }, // Visible to students
    showScores: { type: Boolean, default: true },
    showRanks: { type: Boolean, default: true },
    showNames: { type: Boolean, default: true }, // If false, show anonymous
    maxDisplayEntries: { type: Number, default: 50 },
    autoUpdate: { type: Boolean, default: true }
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  isFinalized: { type: Boolean, default: false }, // No more changes allowed
  lastUpdated: { type: Date, default: Date.now },
  
  // Performance Insights
  insights: {
    topPerformers: [{ // Top 10% performers
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      score: Number,
      rank: Number
    }],
    strugglingStudents: [{ // Bottom 20% performers
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      score: Number,
      rank: Number,
      needsHelp: { type: Boolean, default: true }
    }],
    mostImproved: [{ // Students who improved most from previous assignments
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      currentScore: Number,
      previousScore: Number,
      improvement: Number // percentage improvement
    }]
  }
}, {
  timestamps: true
});

// Indexes for performance
leaderboardSchema.index({ assignment: 1 });
leaderboardSchema.index({ classroom: 1 });
leaderboardSchema.index({ 'entries.rank': 1 });
leaderboardSchema.index({ 'entries.student': 1 });
leaderboardSchema.index({ 'entries.score': -1 });
leaderboardSchema.index({ lastUpdated: -1 });

// Update statistics before saving
leaderboardSchema.pre('save', function(next) {
  if (this.entries && this.entries.length > 0) {
    const scores = this.entries.map(entry => entry.score);
    const times = this.entries.map(entry => entry.timeSpent).filter(t => t > 0);
    
    // Basic statistics
    this.stats.totalParticipants = this.entries.length;
    this.stats.averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    this.stats.highestScore = Math.max(...scores);
    this.stats.lowestScore = Math.min(...scores);
    
    // Median score
    const sortedScores = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sortedScores.length / 2);
    this.stats.medianScore = sortedScores.length % 2 !== 0 
      ? sortedScores[mid] 
      : (sortedScores[mid - 1] + sortedScores[mid]) / 2;
    
    // Standard deviation
    const mean = this.stats.averageScore;
    const squaredDiffs = scores.map(score => Math.pow(score - mean, 2));
    this.stats.standardDeviation = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / scores.length);
    
    // Pass rate (assuming 60% is passing)
    const passingScore = 60;
    const passedCount = this.entries.filter(entry => entry.percentage >= passingScore).length;
    this.stats.passRate = (passedCount / this.entries.length) * 100;
    
    // Average time
    if (times.length > 0) {
      this.stats.averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    }
    
    this.lastUpdated = new Date();
  }
  next();
});

// Methods
leaderboardSchema.methods.addOrUpdateEntry = function(studentId, submissionData) {
  const existingEntryIndex = this.entries.findIndex(
    entry => entry.student.toString() === studentId.toString()
  );
  
  const entryData = {
    student: studentId,
    score: submissionData.score,
    maxScore: submissionData.maxScore,
    percentage: submissionData.percentage,
    submission: submissionData.submissionId,
    submittedAt: submissionData.submittedAt,
    timeSpent: submissionData.timeSpent || 0,
    correctAnswers: submissionData.correctAnswers || 0,
    totalQuestions: submissionData.totalQuestions || 0,
    accuracy: submissionData.accuracy || 0
  };
  
  if (existingEntryIndex >= 0) {
    // Update existing entry
    this.entries[existingEntryIndex] = { ...this.entries[existingEntryIndex], ...entryData };
  } else {
    // Add new entry
    this.entries.push(entryData);
  }
  
  // Recalculate ranks
  this.calculateRanks();
  
  return this.save();
};

leaderboardSchema.methods.calculateRanks = function() {
  // Sort entries by score (descending), then by submission time (ascending) for ties
  this.entries.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score; // Higher score wins
    }
    return new Date(a.submittedAt) - new Date(b.submittedAt); // Earlier submission wins ties
  });
  
  // Assign ranks
  let currentRank = 1;
  for (let i = 0; i < this.entries.length; i++) {
    if (i > 0 && this.entries[i].score < this.entries[i - 1].score) {
      currentRank = i + 1;
    }
    this.entries[i].rank = currentRank;
  }
  
  // Update special recognitions
  this.updateSpecialRecognitions();
};

leaderboardSchema.methods.updateSpecialRecognitions = function() {
  if (this.entries.length === 0) return;
  
  // Reset all special recognitions
  this.entries.forEach(entry => {
    entry.isTopPerformer = false;
    entry.isFastestCompletion = false;
  });
  
  // Mark top performers (top 10% or at least top 3)
  const topCount = Math.max(3, Math.ceil(this.entries.length * 0.1));
  for (let i = 0; i < Math.min(topCount, this.entries.length); i++) {
    this.entries[i].isTopPerformer = true;
  }
  
  // Mark fastest completion (among top scorers)
  const topScore = this.entries[0]?.score;
  const topScorers = this.entries.filter(entry => entry.score === topScore);
  if (topScorers.length > 1) {
    const fastest = topScorers.reduce((prev, current) => 
      (prev.timeSpent < current.timeSpent) ? prev : current
    );
    const fastestIndex = this.entries.findIndex(entry => entry._id === fastest._id);
    if (fastestIndex >= 0) {
      this.entries[fastestIndex].isFastestCompletion = true;
    }
  }
};

leaderboardSchema.methods.generateInsights = async function() {
  if (this.entries.length === 0) return;
  
  // Top performers (top 10%)
  const topCount = Math.max(1, Math.ceil(this.entries.length * 0.1));
  this.insights.topPerformers = this.entries.slice(0, topCount).map(entry => ({
    student: entry.student,
    score: entry.score,
    rank: entry.rank
  }));
  
  // Struggling students (bottom 20%)
  const strugglingCount = Math.max(1, Math.ceil(this.entries.length * 0.2));
  this.insights.strugglingStudents = this.entries
    .slice(-strugglingCount)
    .map(entry => ({
      student: entry.student,
      score: entry.score,
      rank: entry.rank,
      needsHelp: entry.percentage < 60
    }));
  
  return this.save();
};

leaderboardSchema.methods.getStudentRank = function(studentId) {
  const entry = this.entries.find(entry => entry.student.toString() === studentId.toString());
  return entry ? entry.rank : null;
};

leaderboardSchema.methods.getTopN = function(n = 10) {
  return this.entries.slice(0, n);
};

// Virtual for completion rate
leaderboardSchema.virtual('completionRate').get(function() {
  // This would need to be calculated based on total enrolled students
  // For now, return 100% as all entries represent completed submissions
  return 100;
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
