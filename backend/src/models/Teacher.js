const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const teacherSchema = new mongoose.Schema({
  // Basic Authentication Fields
  username: {
    type: String,
    required: true,
    unique: true, // already indexed
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true, // already indexed
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Teacher Profile Fields
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Teacher-Specific Fields
  department: {
    type: String,
    required: true,
    trim: true
  },
  qualification: {
    type: String,
    required: true,
    trim: true
  },
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  specialization: [{
    type: String,
    trim: true
  }],
  
  // Classroom Management
  classrooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  }],
  
  // Teaching Statistics
  stats: {
    totalClassrooms: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    totalAssignments: { type: Number, default: 0 },
    totalMaterials: { type: Number, default: 0 },
    averageClassPerformance: { type: Number, default: 0 }
  },
  
  // Achievements and Recognition
  badges: [{
    type: String,
    enum: ['mentor', 'creator', 'innovator', 'leader', 'achiever']
  }],
  
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
  
  // Preferences
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light'
    }
  }
}, {
  timestamps: true
});

// ✅ Only keep non-unique performance index
teacherSchema.index({ department: 1 });

// Hash password before saving
teacherSchema.pre('save', async function(next) {
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
teacherSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
teacherSchema.methods.toJSON = function() {
  const teacher = this.toObject();
  delete teacher.password;
  return teacher;
};

// Virtual for full name if needed
teacherSchema.virtual('fullName').get(function() {
  return this.name;
});

module.exports = mongoose.model('Teacher', teacherSchema);