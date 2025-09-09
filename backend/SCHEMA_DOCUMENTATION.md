# EduTrack MongoDB Database Schema Documentation

## Overview
Complete MongoDB schema for EduTrack Student Learning Portal with 10 collections supporting dual authentication, AI-powered features, and comprehensive learning management.

## Collections

### 1. **Teacher Collection**
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (bcrypt hashed),
  name: String (required),
  avatar: String,
  department: String (required),
  qualification: String (required),
  experience: Number (required),
  specialization: [String],
  classrooms: [ObjectId] (ref: Classroom),
  stats: {
    totalClassrooms: Number,
    totalStudents: Number,
    totalAssignments: Number,
    totalMaterials: Number,
    averageClassPerformance: Number
  },
  badges: [String] (enum: mentor, creator, innovator, leader, achiever),
  phone: String,
  address: Object,
  isActive: Boolean,
  isVerified: Boolean,
  preferences: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **Student Collection**
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (bcrypt hashed),
  name: String (required),
  avatar: String,
  studentId: String (unique, required),
  grade: String (required),
  rollNumber: String,
  dateOfBirth: Date,
  classrooms: [ObjectId] (ref: Classroom),
  stats: {
    totalAssignments: Number,
    completedAssignments: Number,
    pendingAssignments: Number,
    averageScore: Number,
    streak: Number,
    longestStreak: Number,
    rank: Number,
    totalPoints: Number,
    level: Number
  },
  badges: [String] (enum: consistent, achiever, creator, helper, early_bird, perfectionist, dedicated),
  subjects: [Object],
  submissions: [ObjectId] (ref: Submission),
  doubts: [ObjectId] (ref: Doubt),
  guardian: Object,
  phone: String,
  address: Object,
  isActive: Boolean,
  isVerified: Boolean,
  preferences: Object,
  lastActive: Date,
  streakLastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. **Classroom Collection**
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  subject: String (required),
  grade: String (required),
  teacher: ObjectId (ref: Teacher, required),
  inviteCode: String (unique, auto-generated),
  isPublic: Boolean,
  students: [{
    studentId: ObjectId (ref: Student),
    joinedAt: Date,
    isActive: Boolean
  }],
  materials: [ObjectId] (ref: Material),
  assignments: [ObjectId] (ref: Assignment),
  stats: Object,
  settings: Object,
  isActive: Boolean,
  isArchived: Boolean,
  schedule: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. **Material Collection**
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  type: String (enum: pdf, link, note, video, image, document, presentation),
  file: Object, // File metadata
  link: Object, // External link data
  content: String, // Text content
  aiSummary: {
    summary: String,
    keyPoints: [String],
    difficulty: String (enum: beginner, intermediate, advanced),
    estimatedReadTime: Number,
    tags: [String],
    isGenerated: Boolean,
    generatedAt: Date,
    confidence: Number
  },
  classroom: ObjectId (ref: Classroom, required),
  teacher: ObjectId (ref: Teacher, required),
  subject: String (required),
  topic: String,
  grade: String (required),
  isPublic: Boolean,
  isActive: Boolean,
  views: [Object], // Student view tracking
  downloads: [Object], // Download tracking
  stats: Object,
  ratings: [Object], // Student ratings
  publishedAt: Date,
  scheduledFor: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. **Assignment Collection**
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  instructions: String,
  type: String (enum: quiz, assignment, test, homework, project),
  classroom: ObjectId (ref: Classroom, required),
  teacher: ObjectId (ref: Teacher, required),
  questions: [{
    type: String (enum: mcq, short_answer, long_answer, true_false, fill_blank, matching),
    question: String (required),
    options: [Object], // For MCQ
    correctAnswer: String,
    acceptableAnswers: [String],
    points: Number (required),
    difficulty: String (enum: easy, medium, hard),
    timeLimit: Number,
    explanation: String,
    hints: [String],
    attachments: [Object],
    order: Number (required)
  }],
  totalPoints: Number (auto-calculated),
  passingScore: Number,
  gradingType: String (enum: auto, manual, hybrid),
  timeLimit: Number,
  attemptsAllowed: Number,
  publishedAt: Date,
  startDate: Date,
  dueDate: Date,
  lateSubmissionAllowed: Boolean,
  latePenalty: Number,
  settings: Object,
  status: String (enum: draft, published, active, completed, archived),
  isActive: Boolean,
  submissions: [ObjectId] (ref: Submission),
  doubts: [ObjectId] (ref: Doubt),
  stats: Object,
  aiGenerated: Object, // AI generation metadata
  subject: String (required),
  topics: [String],
  grade: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### 6. **Submission Collection**
```javascript
{
  _id: ObjectId,
  assignment: ObjectId (ref: Assignment, required),
  student: ObjectId (ref: Student, required),
  classroom: ObjectId (ref: Classroom, required),
  answers: [{
    questionId: ObjectId (required),
    questionType: String (required),
    answer: Mixed, // Student's answer
    selectedOption: String, // For MCQ
    points: Number,
    maxPoints: Number (required),
    isCorrect: Boolean,
    timeSpent: Number,
    answeredAt: Date,
    manualGrade: Object // Teacher grading
  }],
  score: Number,
  maxScore: Number (required),
  percentage: Number,
  grade: String, // Letter grade
  status: String (enum: draft, submitted, graded, returned),
  attemptNumber: Number,
  startedAt: Date,
  submittedAt: Date,
  timeSpent: Number,
  isLate: Boolean,
  latePenaltyApplied: Number,
  aiReport: {
    overallPerformance: String,
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    subjectAnalysis: [Object],
    difficultyAnalysis: Object,
    timeAnalysis: Object,
    learningInsights: Object,
    peerComparison: Object,
    generatedAt: Date,
    aiModel: String,
    confidence: Number
  },
  teacherFeedback: Object,
  cheatingFlags: Object,
  attachments: [Object],
  createdAt: Date,
  updatedAt: Date
}
```

### 7. **Doubt Collection**
```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (required),
  assignment: ObjectId (ref: Assignment, required),
  classroom: ObjectId (ref: Classroom, required),
  student: ObjectId (ref: Student, required),
  questionId: ObjectId, // Optional specific question
  questionNumber: Number,
  category: String (enum: concept, procedure, clarification, technical, general),
  subject: String (required),
  topics: [String],
  priority: String (enum: low, medium, high, urgent),
  status: String (enum: open, answered, resolved, closed),
  isPublic: Boolean,
  isAnonymous: Boolean,
  replies: [{
    content: String (required),
    author: ObjectId (required),
    authorType: String (enum: Student, Teacher),
    isAnswer: Boolean,
    isHelpful: Boolean,
    upvotes: Number,
    downvotes: Number,
    votes: [Object],
    attachments: [Object],
    isEdited: Boolean,
    editedAt: Date,
    isDeleted: Boolean,
    deletedAt: Date,
    createdAt: Date,
    updatedAt: Date
  }],
  acceptedAnswer: ObjectId,
  views: Number,
  upvotes: Number,
  downvotes: Number,
  votes: [Object],
  attachments: [Object],
  teacherResponse: Object,
  aiSuggestions: Object,
  lastActivity: Date,
  resolvedAt: Date,
  closedAt: Date,
  flags: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. **Badge Collection**
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String (required),
  type: String (enum: achievement, milestone, streak, participation, performance, special),
  category: String (enum: academic, participation, consistency, leadership, creativity, improvement),
  icon: String (required),
  color: String,
  rarity: String (enum: common, uncommon, rare, epic, legendary),
  points: Number (required),
  requirements: {
    minimumScore: Number,
    minimumAssignments: Number,
    consecutiveDays: Number,
    materialsViewed: Number,
    doubtsAnswered: Number,
    helpfulReplies: Number,
    averageScore: Number,
    improvementPercentage: Number,
    rankPosition: Number,
    timeFrame: String,
    subjects: [String],
    customConditions: [Object]
  },
  isActive: Boolean,
  isHidden: Boolean,
  classroom: ObjectId (ref: Classroom), // null for global badges
  teacher: ObjectId (ref: Teacher), // null for system badges
  stats: {
    totalEarned: Number,
    studentsEarned: [ObjectId] (ref: Student)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 9. **Milestone Collection**
```javascript
{
  _id: ObjectId,
  student: ObjectId (ref: Student, required),
  badge: ObjectId (ref: Badge, required),
  classroom: ObjectId (ref: Classroom),
  earnedAt: Date,
  triggerEvent: String (enum: assignment_completion, score_achievement, streak_milestone, participation, improvement, manual_award),
  triggerData: Object,
  progress: {
    current: Number,
    required: Number,
    percentage: Number
  },
  status: String (enum: in_progress, earned, expired),
  isNotified: Boolean,
  notifiedAt: Date,
  isValid: Boolean,
  validatedAt: Date,
  validatedBy: ObjectId (ref: Teacher),
  createdAt: Date,
  updatedAt: Date
}
```

### 10. **Leaderboard Collection**
```javascript
{
  _id: ObjectId,
  assignment: ObjectId (ref: Assignment, required, unique),
  classroom: ObjectId (ref: Classroom, required),
  teacher: ObjectId (ref: Teacher, required),
  entries: [{
    student: ObjectId (ref: Student, required),
    rank: Number (required),
    score: Number (required),
    maxScore: Number (required),
    percentage: Number (required),
    submission: ObjectId (ref: Submission, required),
    submittedAt: Date (required),
    timeSpent: Number,
    correctAnswers: Number,
    totalQuestions: Number (required),
    accuracy: Number,
    badgesEarned: [Object],
    isTopPerformer: Boolean,
    isMostImproved: Boolean,
    isFastestCompletion: Boolean,
    currentStreak: Number,
    streakAtSubmission: Number
  }],
  stats: {
    totalParticipants: Number,
    averageScore: Number,
    highestScore: Number,
    lowestScore: Number,
    medianScore: Number,
    standardDeviation: Number,
    passRate: Number,
    averageTime: Number,
    completionRate: Number
  },
  settings: Object,
  isActive: Boolean,
  isFinalized: Boolean,
  lastUpdated: Date,
  insights: {
    topPerformers: [Object],
    strugglingStudents: [Object],
    mostImproved: [Object]
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features

### 🔐 **Authentication & Security**
- Dual role system (Student/Teacher)
- Bcrypt password hashing
- JWT + Session authentication
- Role-based access control

### 🤖 **AI Integration**
- AI-generated material summaries
- AI-powered performance reports
- AI quiz generation capabilities
- AI-suggested study recommendations

### 📊 **Analytics & Insights**
- Comprehensive leaderboards
- Performance tracking
- Learning analytics
- Progress monitoring

### 🏆 **Gamification**
- Badge system with multiple rarities
- Milestone tracking
- Streak counters
- Achievement rewards

### 💬 **Collaboration**
- Q&A system with voting
- Student-teacher interactions
- Peer discussions
- Anonymous questioning

### 📚 **Content Management**
- Multiple material types
- File upload support
- Content scheduling
- Access control

## Relationships

```
Teacher (1) ←→ (N) Classroom ←→ (N) Student
Classroom (1) ←→ (N) Material
Classroom (1) ←→ (N) Assignment
Assignment (1) ←→ (N) Submission ←→ (1) Student
Assignment (1) ←→ (N) Doubt ←→ (1) Student
Assignment (1) ←→ (1) Leaderboard
Student (1) ←→ (N) Milestone ←→ (1) Badge
```

This comprehensive schema supports all EduTrack requirements with scalable, efficient MongoDB document structure optimized for educational workflows.
