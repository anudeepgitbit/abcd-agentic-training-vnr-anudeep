# EduTrack Backend API

A Node.js + Express backend with MongoDB that supports dual authentication methods: JWT tokens and session-based authentication.

## Features

- User registration and login
- Dual authentication support (JWT + Sessions)
- Password hashing with bcrypt
- MongoDB session store
- Protected routes
- CORS enabled
- Environment variable configuration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
MONGO_URI=mongodb://localhost:27017/edutrack
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

3. Start MongoDB service on your machine

4. Run the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Routes

#### POST /api/auth/register
Register a new user
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "user": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}
```

#### POST /api/auth/logout
Logout user (requires authentication)
- Destroys session and clears session cookie

#### GET /api/auth/me
Get current user profile (requires authentication)
- Works with either JWT token or valid session

Response:
```json
{
  "user": {
    "_id": "...",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "authMethod": "jwt" // or "session"
}
```

### Health Check

#### GET /api/health
Check server status
```json
{
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication Methods

### JWT Authentication
Include the token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

### Session Authentication
Sessions are automatically managed via cookies. After login, subsequent requests will include the session cookie automatically.

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── controllers/
│   │   └── authController.js # Authentication logic
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   ├── models/
│   │   └── User.js          # User model
│   └── routes/
│       └── auth.js          # Authentication routes
├── .env                     # Environment variables
├── package.json
└── server.js               # Main server file
```

## Security Features

- Passwords are hashed using bcrypt with salt rounds of 12
- JWT tokens expire after 7 days
- Sessions expire after 7 days
- HTTP-only cookies in production
- CORS protection
- Input validation
- Error handling middleware
