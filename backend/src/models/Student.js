const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  // Basic Authentication Fields
  username: {
    type: String,
    required: true,
    unique: true, // this already creates an index
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true, // this already creates an index
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Student Profile Fields
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Student-Specific Fields
  studentId: {
    type: String,
    required: true,
    unique: true, // this already creates an index
    trim: true
  },
  grade: {
    type: String,
    required: true,
    trim: true
  },
  rollNumber: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  
  // Academic Information
  classrooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  }],
  
  // Academic Statistics
  stats: {
    totalAssignments: { type: Number, default: 0 },
    completedAssignments: { type: Number, default: 0 },
    pendingAssignments: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    rank: { type: Number, default: null },
    totalPoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
  },
  
  // Achievements and Badges
  badges: [{
    type: String,
    enum: ['consistent', 'achiever', 'creator', 'helper', 'early_bird', 'perfectionist', 'dedicated']
  }],
  
  // Learning Progress
  subjects: [{
    name: { type: String, required: true },
    grade: { type: String },
    averageScore: { type: Number, default: 0 },
    totalAssignments: { type: Number, default: 0 },
    completedAssignments: { type: Number, default: 0 }
  }],
  
  // Submissions and Assignments
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }],
  
  // Doubts and Questions
  doubts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doubt' }],
  
  // Parent/Guardian Information
  guardian: {
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    relationship: { type: String, enum: ['parent', 'guardian', 'other'], default: 'parent' }
  },
  
  // Contact Information
  phone: { type: String, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Account Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  
  // Learning Preferences
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    reminderNotifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    studyReminders: { type: Boolean, default: true }
  },
  
  // Activity Tracking
  lastActive: { type: Date, default: Date.now },
  streakLastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ✅ Only keep extra index if needed (non-unique, performance purpose)
studentSchema.index({ grade: 1 });  

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
studentSchema.methods.toJSON = function() {
  const student = this.toObject();
  delete student.password;
  return student;
};

// Calculate completion percentage
studentSchema.methods.getCompletionPercentage = function() {
  if (this.stats.totalAssignments === 0) return 0;
  return Math.round((this.stats.completedAssignments / this.stats.totalAssignments) * 100);
};

// Update streak logic
studentSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastUpdate = new Date(this.streakLastUpdated);
  const daysDiff = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    this.stats.streak += 1;
    if (this.stats.streak > this.stats.longestStreak) {
      this.stats.longestStreak = this.stats.streak;
    }
  } else if (daysDiff > 1) {
    this.stats.streak = 1;
  }
  
  this.streakLastUpdated = today;
  this.lastActive = today;
};

// Virtual for full name if needed
studentSchema.virtual('fullName').get(function() {
  return this.name;
});

module.exports = mongoose.model('Student', studentSchema);
