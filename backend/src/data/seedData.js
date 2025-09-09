const bcrypt = require('bcryptjs');

// Dummy Teachers Data
const teachersData = [
  {
    username: 'john_teacher',
    email: 'john@teacher.com',
    password: 'password123',
    name: 'John Smith',
    department: 'Mathematics',
    qualification: 'M.Sc Mathematics',
    experience: 5,
    specialization: ['Algebra', 'Calculus', 'Statistics'],
    phone: '+1234567890',
    stats: {
      totalClassrooms: 3,
      totalStudents: 85,
      totalAssignments: 45,
      totalMaterials: 120,
      averageClassPerformance: 78.5
    },
    badges: ['mentor', 'creator', 'achiever'],
    isActive: true,
    isVerified: true
  },
  {
    username: 'sarah_teacher',
    email: 'sarah@teacher.com',
    password: 'password123',
    name: 'Sarah Johnson',
    department: 'Science',
    qualification: 'Ph.D Physics',
    experience: 8,
    specialization: ['Physics', 'Chemistry', 'Biology'],
    phone: '+1234567891',
    stats: {
      totalClassrooms: 4,
      totalStudents: 110,
      totalAssignments: 62,
      totalMaterials: 95,
      averageClassPerformance: 82.3
    },
    badges: ['innovator', 'leader', 'mentor'],
    isActive: true,
    isVerified: true
  },
  {
    username: 'mike_teacher',
    email: 'mike@teacher.com',
    password: 'password123',
    name: 'Michael Brown',
    department: 'English',
    qualification: 'M.A English Literature',
    experience: 6,
    specialization: ['Literature', 'Grammar', 'Creative Writing'],
    phone: '+1234567892',
    stats: {
      totalClassrooms: 2,
      totalStudents: 65,
      totalAssignments: 38,
      totalMaterials: 75,
      averageClassPerformance: 75.8
    },
    badges: ['creator', 'mentor'],
    isActive: true,
    isVerified: true
  }
];

// Dummy Students Data
const studentsData = [
  {
    username: 'alice_student',
    email: 'alice@student.com',
    password: 'password123',
    name: 'Alice Wilson',
    studentId: 'STU001',
    grade: '10th Grade',
    rollNumber: 'R001',
    dateOfBirth: new Date('2008-05-15'),
    phone: '+1234567893',
    stats: {
      totalAssignments: 25,
      completedAssignments: 22,
      pendingAssignments: 3,
      averageScore: 87.5,
      streak: 15,
      longestStreak: 28,
      rank: 3,
      totalPoints: 2250,
      level: 5
    },
    badges: ['consistent', 'achiever', 'early_bird'],
    subjects: [
      { name: 'Mathematics', grade: 'A', averageScore: 92, totalAssignments: 8, completedAssignments: 8 },
      { name: 'Science', grade: 'A-', averageScore: 88, totalAssignments: 9, completedAssignments: 8 },
      { name: 'English', grade: 'B+', averageScore: 82, totalAssignments: 8, completedAssignments: 6 }
    ],
    guardian: {
      name: 'Robert Wilson',
      email: 'robert.wilson@email.com',
      phone: '+1234567894',
      relationship: 'parent'
    },
    isActive: true,
    isVerified: true
  },
  {
    username: 'bob_student',
    email: 'bob@student.com',
    password: 'password123',
    name: 'Bob Davis',
    studentId: 'STU002',
    grade: '10th Grade',
    rollNumber: 'R002',
    dateOfBirth: new Date('2008-08-22'),
    phone: '+1234567895',
    stats: {
      totalAssignments: 25,
      completedAssignments: 18,
      pendingAssignments: 7,
      averageScore: 76.3,
      streak: 8,
      longestStreak: 15,
      rank: 8,
      totalPoints: 1580,
      level: 3
    },
    badges: ['helper', 'dedicated'],
    subjects: [
      { name: 'Mathematics', grade: 'B', averageScore: 78, totalAssignments: 8, completedAssignments: 6 },
      { name: 'Science', grade: 'B+', averageScore: 82, totalAssignments: 9, completedAssignments: 7 },
      { name: 'English', grade: 'B-', averageScore: 69, totalAssignments: 8, completedAssignments: 5 }
    ],
    guardian: {
      name: 'Linda Davis',
      email: 'linda.davis@email.com',
      phone: '+1234567896',
      relationship: 'parent'
    },
    isActive: true,
    isVerified: true
  },
  {
    username: 'carol_student',
    email: 'carol@student.com',
    password: 'password123',
    name: 'Carol Martinez',
    studentId: 'STU003',
    grade: '11th Grade',
    rollNumber: 'R003',
    dateOfBirth: new Date('2007-12-10'),
    phone: '+1234567897',
    stats: {
      totalAssignments: 30,
      completedAssignments: 28,
      pendingAssignments: 2,
      averageScore: 94.2,
      streak: 22,
      longestStreak: 35,
      rank: 1,
      totalPoints: 3150,
      level: 7
    },
    badges: ['consistent', 'achiever', 'perfectionist', 'early_bird'],
    subjects: [
      { name: 'Mathematics', grade: 'A+', averageScore: 96, totalAssignments: 10, completedAssignments: 10 },
      { name: 'Science', grade: 'A+', averageScore: 95, totalAssignments: 10, completedAssignments: 9 },
      { name: 'English', grade: 'A', averageScore: 91, totalAssignments: 10, completedAssignments: 9 }
    ],
    guardian: {
      name: 'Carlos Martinez',
      email: 'carlos.martinez@email.com',
      phone: '+1234567898',
      relationship: 'parent'
    },
    isActive: true,
    isVerified: true
  }
];

// Dummy Assignments Data
const assignmentsData = [
  {
    title: 'Quadratic Equations Practice',
    description: 'Solve the given quadratic equations using different methods',
    subject: 'Mathematics',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    totalMarks: 100,
    difficulty: 'medium',
    status: 'active',
    instructions: 'Complete all 15 problems showing your work clearly'
  },
  {
    title: 'Chemical Reactions Lab Report',
    description: 'Write a detailed lab report on the chemical reactions observed',
    subject: 'Science',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    totalMarks: 50,
    difficulty: 'hard',
    status: 'active',
    instructions: 'Include observations, conclusions, and chemical equations'
  },
  {
    title: 'Shakespeare Essay',
    description: 'Write an analytical essay on Hamlet',
    subject: 'English',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    totalMarks: 75,
    difficulty: 'medium',
    status: 'active',
    instructions: 'Minimum 1000 words, include citations'
  }
];

// Dummy Announcements Data
const announcementsData = [
  {
    title: 'Mid-term Examinations Schedule',
    content: 'Mid-term examinations will be conducted from March 15-22. Please check your individual schedules.',
    priority: 'high',
    type: 'exam',
    isActive: true,
    createdAt: new Date()
  },
  {
    title: 'Science Fair Registration',
    content: 'Registration for the annual science fair is now open. Submit your project proposals by March 10.',
    priority: 'medium',
    type: 'event',
    isActive: true,
    createdAt: new Date()
  },
  {
    title: 'Library Hours Extended',
    content: 'Library hours have been extended until 8 PM on weekdays to support exam preparation.',
    priority: 'low',
    type: 'general',
    isActive: true,
    createdAt: new Date()
  }
];

// Dummy Performance Data
const performanceData = {
  weeklyProgress: [
    { week: 'Week 1', completed: 8, total: 10, percentage: 80 },
    { week: 'Week 2', completed: 9, total: 10, percentage: 90 },
    { week: 'Week 3', completed: 7, total: 10, percentage: 70 },
    { week: 'Week 4', completed: 10, total: 10, percentage: 100 }
  ],
  subjectPerformance: [
    { subject: 'Mathematics', score: 92, grade: 'A', trend: 'up' },
    { subject: 'Science', score: 88, grade: 'A-', trend: 'stable' },
    { subject: 'English', score: 82, grade: 'B+', trend: 'up' },
    { subject: 'History', score: 78, grade: 'B', trend: 'down' }
  ]
};

module.exports = {
  teachersData,
  studentsData,
  assignmentsData,
  announcementsData,
  performanceData
};
