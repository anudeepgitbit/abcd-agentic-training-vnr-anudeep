# EduTrack Deployment Guide

## 🚀 Complete Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create `.env` file in backend root:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/edutrack
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   SESSION_SECRET=your-session-secret-key-here
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Cloudinary (for file uploads)
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Gemini AI (for AI Assistant)
   GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create `.env` file in frontend root:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 🔧 Features Integrated

### ✅ Authentication System
- JWT + Session-based dual authentication
- Role-based access (Teacher/Student)
- Protected routes with role verification
- Secure password hashing with bcrypt

### ✅ Dashboard
- Dynamic statistics from backend
- Real-time recent activity feed
- Material upload with Cloudinary integration
- Classroom management modal

### ✅ AI Assistant
- Gemini API integration for chat
- Quiz generation functionality
- Context-aware responses based on user role
- Loading states and error handling

### ✅ Assignments System
- Full CRUD operations for assignments
- Student submission system
- Teacher grading functionality
- Doubts/Q&A system with voting
- Real-time updates and notifications

### ✅ Classrooms Management
- Classroom creation and management
- Student enrollment with invite codes
- Detailed classroom analytics
- Performance tracking and insights
- Student removal and management

### ✅ ManageClassroom Page
- Comprehensive classroom overview
- Tabbed interface for different sections
- Student search and management
- Assignment and material tracking
- Performance analytics with visual indicators

### ✅ Profile Management
- Dynamic user profile data
- Achievement badges system
- Activity feed and progress tracking
- Profile editing capabilities

### ✅ Materials System
- File upload with Cloudinary
- AI-generated summaries
- Material categorization
- Download tracking

## 🎯 User Flows

### Teacher Flow
1. **Login** → Dashboard with statistics
2. **Create Classroom** → Generate invite codes
3. **Upload Materials** → AI summaries generated
4. **Create Assignments** → Set questions and grading
5. **Manage Students** → View submissions and grade
6. **AI Assistant** → Get teaching insights

### Student Flow
1. **Login** → Dashboard with progress
2. **Join Classroom** → Using invite code
3. **View Assignments** → Submit answers
4. **Ask Doubts** → Get help from teachers/AI
5. **Track Progress** → View grades and badges
6. **AI Assistant** → Get learning help

## 🔐 Security Features
- Password hashing with bcrypt (12 salt rounds)
- JWT tokens with 7-day expiration
- Session management with MongoDB store
- CORS configuration for frontend
- Input validation and sanitization
- Role-based route protection

## 📊 Database Schema
- **Teachers**: Profile, classrooms, statistics, badges
- **Students**: Profile, enrollments, submissions, progress
- **Classrooms**: Details, students, assignments, materials
- **Assignments**: Questions, submissions, grading
- **Materials**: Files, AI summaries, metadata
- **Doubts**: Q&A system with voting
- **Badges**: Achievement system
- **Leaderboards**: Performance rankings

## 🚨 Troubleshooting

### Common Issues

1. **Backend won't start:**
   - Check MongoDB connection
   - Verify environment variables
   - Ensure port 5000 is available

2. **Frontend API errors:**
   - Confirm backend is running on port 5000
   - Check VITE_API_URL in frontend .env
   - Verify CORS settings in backend

3. **Authentication issues:**
   - Clear localStorage and cookies
   - Check JWT_SECRET and SESSION_SECRET
   - Verify user roles in database

4. **File upload failures:**
   - Confirm Cloudinary credentials
   - Check file size limits
   - Verify network connectivity

## 🔄 Development Workflow

1. **Start Backend:** `cd backend && npm start`
2. **Start Frontend:** `cd frontend && npm run dev`
3. **Access Application:** `http://localhost:5173`
4. **API Documentation:** `http://localhost:5000/api`

## 📝 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Dashboard data loading
- [ ] Classroom creation and management
- [ ] Assignment creation and submission
- [ ] Material upload and download
- [ ] AI Assistant functionality
- [ ] Profile management
- [ ] Role-based access control

### API Testing
Use tools like Postman or Thunder Client to test:
- Authentication endpoints
- CRUD operations
- File upload endpoints
- AI integration endpoints

## 🚀 Production Deployment

### Backend (Node.js)
- Use PM2 for process management
- Set NODE_ENV=production
- Use MongoDB Atlas for cloud database
- Configure proper CORS origins
- Set up SSL certificates

### Frontend (React/Vite)
- Build: `npm run build`
- Deploy to Netlify, Vercel, or similar
- Update API URL to production backend
- Configure environment variables

## 📞 Support
For issues or questions:
1. Check console logs for errors
2. Verify environment configuration
3. Test API endpoints individually
4. Review network connectivity

---

**EduTrack** - Complete Educational Platform with AI Integration
