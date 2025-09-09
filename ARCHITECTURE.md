# EduTrack Project Architecture

## 🏗️ Overall Architecture

EduTrack follows a **Full-Stack MERN Architecture** with AI integration and dual authentication system.

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Student   │  │   Teacher   │  │    Auth     │         │
│  │ Dashboard   │  │ Dashboard   │  │  System     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                    API LAYER (REST)                         │
├─────────────────────────────────────────────────────────────┤
│                BACKEND (Node.js + Express)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │Controllers  │  │Middleware   │  │   Models    │         │
│  │   & Routes  │  │    & Auth   │  │ (Mongoose)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                DATABASE (MongoDB)                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Users     │  │ Classrooms  │  │Assignments  │         │
│  │ (Students/  │  │ Materials   │  │Submissions  │         │
│  │ Teachers)   │  │   Doubts    │  │Leaderboards │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
EduTrack/
├── frontend/                    # React TypeScript Frontend
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── placeholder.svg
│   │   └── robots.txt
│   ├── src/
│   │   ├── components/          # Reusable UI Components
│   │   │   ├── ui/             # Base UI components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   ├── classroom/      # Classroom management
│   │   │   ├── assignment/     # Assignment components
│   │   │   └── material/       # Material components
│   │   ├── contexts/           # React Context providers
│   │   │   └── AuthContext.tsx # Authentication state
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API service layer
│   │   │   └── api.ts          # Backend API integration
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Utility functions
│   │   ├── App.tsx             # Main app component
│   │   └── main.tsx            # App entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env                    # Environment variables
│
├── backend/                     # Node.js Express Backend
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   │   └── database.js     # MongoDB connection
│   │   ├── controllers/        # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── classroomController.js
│   │   │   ├── assignmentController.js
│   │   │   └── materialController.js
│   │   ├── middleware/         # Express middleware
│   │   │   └── auth.js         # Authentication middleware
│   │   ├── models/             # MongoDB schemas
│   │   │   ├── Student.js      # Student schema
│   │   │   ├── Teacher.js      # Teacher schema
│   │   │   ├── Classroom.js    # Classroom schema
│   │   │   ├── Material.js     # Material schema
│   │   │   ├── Assignment.js   # Assignment schema
│   │   │   ├── Submission.js   # Submission schema
│   │   │   ├── Doubt.js        # Doubt/Q&A schema
│   │   │   ├── Badge.js        # Badge & Milestone schemas
│   │   │   ├── Leaderboard.js  # Leaderboard schema
│   │   │   └── index.js        # Model exports
│   │   ├── routes/             # API routes
│   │   │   ├── auth.js         # Authentication routes
│   │   │   ├── classroom.js    # Classroom routes
│   │   │   └── assignment.js   # Assignment routes
│   │   ├── scripts/            # Utility scripts
│   │   └── data/               # Seed data
│   ├── .env                    # Environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── server.js               # Server entry point
│   └── README.md
│
├── SCHEMA_DOCUMENTATION.md      # Database schema docs
└── ARCHITECTURE.md              # This file
```

## 🔧 Technology Stack

### **Frontend**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom service layer
- **Routing**: React Router v6
- **UI Components**: Custom component library

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Express Sessions
- **Password Hashing**: bcryptjs
- **Session Store**: MongoDB (connect-mongo)
- **CORS**: Enabled for frontend integration
- **Environment**: dotenv for configuration

### **Database**
- **Primary**: MongoDB (Document-based NoSQL)
- **ODM**: Mongoose for schema validation
- **Indexing**: Optimized indexes for performance
- **Relationships**: Reference-based with population

## 🔐 Authentication Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 DUAL AUTHENTICATION SYSTEM                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │   JWT TOKENS    │         │    SESSIONS     │           │
│  │                 │         │                 │           │
│  │ • 7-day expiry  │   +     │ • MongoDB store │           │
│  │ • localStorage  │         │ • Cookie-based  │           │
│  │ • Stateless     │         │ • Server-side   │           │
│  └─────────────────┘         └─────────────────┘           │
├─────────────────────────────────────────────────────────────┤
│                    ROLE-BASED ACCESS                        │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │    STUDENT      │         │    TEACHER      │           │
│  │                 │         │                 │           │
│  │ • Join classes  │         │ • Create classes│           │
│  │ • Take quizzes  │         │ • Manage students│          │
│  │ • View materials│         │ • Grade assignments│        │
│  │ • Ask doubts    │         │ • Upload materials│         │
│  └─────────────────┘         └─────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema Architecture

### **Core Collections (10 total)**

```
┌─────────────────────────────────────────────────────────────┐
│                     USER MANAGEMENT                         │
│  ┌─────────────┐              ┌─────────────┐              │
│  │   Teacher   │              │   Student   │              │
│  │             │              │             │              │
│  │ • Profile   │              │ • Profile   │              │
│  │ • Auth      │              │ • Auth      │              │
│  │ • Stats     │              │ • Stats     │              │
│  │ • Badges    │              │ • Badges    │              │
│  └─────────────┘              └─────────────┘              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   CLASSROOM ECOSYSTEM                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Classroom   │  │  Material   │  │ Assignment  │         │
│  │             │  │             │  │             │         │
│  │ • Invite    │  │ • AI Summary│  │ • Questions │         │
│  │ • Students  │  │ • Files     │  │ • Grading   │         │
│  │ • Settings  │  │ • Ratings   │  │ • Timing    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 ASSESSMENT & INTERACTION                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Submission  │  │    Doubt    │  │Leaderboard  │         │
│  │             │  │             │  │             │         │
│  │ • AI Report │  │ • Q&A       │  │ • Rankings  │         │
│  │ • Scoring   │  │ • Voting    │  │ • Statistics│         │
│  │ • Feedback  │  │ • Replies   │  │ • Insights  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    GAMIFICATION                             │
│  ┌─────────────┐              ┌─────────────┐              │
│  │    Badge    │              │  Milestone  │              │
│  │             │              │             │              │
│  │ • Types     │              │ • Progress  │              │
│  │ • Rarity    │              │ • Tracking  │              │
│  │ • Requirements│            │ • Rewards   │              │
│  └─────────────┘              └─────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### **Student Workflow**
```
Login → Join Classroom (via invite) → View Materials → Take Assignment → 
Submit Answers → Get AI Report → Ask Doubts → View Leaderboard → Earn Badges
```

### **Teacher Workflow**
```
Login → Create Classroom → Upload Materials → Create Assignment → 
Monitor Submissions → Grade (if manual) → Respond to Doubts → View Analytics
```

### **API Request Flow**
```
Frontend Request → Auth Middleware → Route Controller → 
Database Query → Response Processing → JSON Response
```

## 🤖 AI Integration Points

1. **Material Summaries**: Auto-generate summaries for uploaded content
2. **Performance Reports**: AI analysis of student submissions
3. **Quiz Generation**: AI-powered question creation
4. **Learning Insights**: Personalized study recommendations
5. **Doubt Suggestions**: AI-suggested answers for common questions

## 🚀 Key Features

### **Student Features**
- **Dashboard**: Materials, pending assignments, streak, ranks, quiz scores
- **Materials Page**: Grid/list view with filters, PDF viewer, AI summaries
- **Assignments Page**: Take quizzes, view AI reports, ask doubts
- **Statistics Page**: Quiz scores, streaks, badges, progress tracking

### **Teacher Features**
- **Dashboard**: Materials, quizzes, submissions, student statistics
- **Classrooms Page**: Create classrooms, invite students via codes
- **Materials Page**: Upload resources, manage content
- **Assignments Page**: Create quizzes, manual grading, AI quiz generator
- **AI Assistant Page**: Chat interface, quiz generation tools

## 🔒 Security Features

- **Password Security**: bcrypt hashing with 12 salt rounds
- **Session Management**: MongoDB-backed sessions
- **JWT Security**: 7-day expiration, secure storage
- **Role-based Access**: Middleware-enforced permissions
- **Input Validation**: Mongoose schema validation
- **CORS Protection**: Configured for frontend domain

## 📈 Performance Optimizations

- **Database Indexing**: Strategic indexes on frequently queried fields
- **Lazy Loading**: Components loaded on demand
- **Caching**: Session-based caching for user data
- **Pagination**: Large datasets split into pages
- **Aggregation**: MongoDB aggregation for complex queries

## 🔧 Development & Deployment

### **Development Setup**
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend  
cd frontend
npm install
npm run dev
```

### **Environment Variables**
- **Backend**: MongoDB URI, JWT secrets, session secrets
- **Frontend**: API base URL, environment flags

This architecture provides a scalable, secure, and feature-rich educational platform with modern web technologies and AI integration.
