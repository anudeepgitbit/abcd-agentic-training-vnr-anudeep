const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
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
    maxlength: 1000
  },
  
  // Material Type and Content
  type: {
    type: String,
    required: true,
    enum: ['pdf', 'link', 'note', 'video', 'image', 'document', 'presentation']
  },
  
  // File Information (for uploaded files)
  file: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number, // in bytes
    path: String, // file storage path
    url: String // public URL if applicable
  },
  
  // Link Information (for external resources)
  link: {
    url: String,
    title: String,
    favicon: String,
    preview: String
  },
  
  // Note Content (for text-based materials)
  content: {
    type: String,
    maxlength: 10000
  },
  
  // AI-Generated Summary
  aiSummary: {
    summary: String,
    keyPoints: [String],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    estimatedReadTime: Number, // in minutes
    tags: [String],
    isGenerated: { type: Boolean, default: false },
    generatedAt: Date,
    confidence: { type: Number, min: 0, max: 1 } // AI confidence score
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
  
  // Categorization
  subject: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    trim: true
  },
  grade: {
    type: String,
    required: true,
    trim: true
  },
  
  // Access and Visibility
  isPublic: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  
  // Student Interaction
  views: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    viewedAt: { type: Date, default: Date.now },
    duration: Number, // viewing duration in seconds
    completed: { type: Boolean, default: false }
  }],
  
  downloads: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    downloadedAt: { type: Date, default: Date.now }
  }],
  
  // Statistics
  stats: {
    totalViews: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    totalDownloads: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
  
  // Student Ratings and Feedback
  ratings: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: { type: Date, default: Date.now }
  }],
  
  // Scheduling
  publishedAt: { type: Date, default: Date.now },
  scheduledFor: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes for performance
materialSchema.index({ classroom: 1 });
materialSchema.index({ teacher: 1 });
materialSchema.index({ subject: 1, grade: 1 });
materialSchema.index({ type: 1 });
materialSchema.index({ publishedAt: -1 });
materialSchema.index({ 'views.student': 1 });

// Update stats before saving
materialSchema.pre('save', function(next) {
  // Update view statistics
  this.stats.totalViews = this.views.length;
  this.stats.uniqueViews = [...new Set(this.views.map(v => v.student.toString()))].length;
  this.stats.totalDownloads = this.downloads.length;
  
  // Update rating statistics
  if (this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.stats.averageRating = totalRating / this.ratings.length;
    this.stats.totalRatings = this.ratings.length;
  }
  
  next();
});

// Methods
materialSchema.methods.addView = function(studentId, duration = 0) {
  const existingView = this.views.find(v => v.student.toString() === studentId.toString());
  if (!existingView) {
    this.views.push({ 
      student: studentId, 
      duration,
      completed: duration > 0 
    });
  } else {
    existingView.duration = Math.max(existingView.duration, duration);
    existingView.completed = duration > 0;
    existingView.viewedAt = new Date();
  }
  return this.save();
};

materialSchema.methods.addDownload = function(studentId) {
  const existingDownload = this.downloads.find(d => d.student.toString() === studentId.toString());
  if (!existingDownload) {
    this.downloads.push({ student: studentId });
  }
  return this.save();
};

materialSchema.methods.addRating = function(studentId, rating, feedback = '') {
  const existingRating = this.ratings.find(r => r.student.toString() === studentId.toString());
  if (existingRating) {
    existingRating.rating = rating;
    existingRating.feedback = feedback;
    existingRating.ratedAt = new Date();
  } else {
    this.ratings.push({ student: studentId, rating, feedback });
  }
  return this.save();
};

materialSchema.methods.generateAISummary = async function(summaryData) {
  this.aiSummary = {
    ...summaryData,
    isGenerated: true,
    generatedAt: new Date()
  };
  return this.save();
};

// Virtual for file size in human readable format
materialSchema.virtual('fileSizeFormatted').get(function() {
  if (!this.file || !this.file.size) return null;
  
  const bytes = this.file.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for view completion rate
materialSchema.virtual('completionRate').get(function() {
  if (this.views.length === 0) return 0;
  const completedViews = this.views.filter(v => v.completed).length;
  return Math.round((completedViews / this.views.length) * 100);
});

module.exports = mongoose.model('Material', materialSchema);
