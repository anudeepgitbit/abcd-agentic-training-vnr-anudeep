# EduTrack Quick Start Guide

## 🚨 Fix API Errors - Follow These Steps

### Step 1: Start MongoDB
```bash
# Option 1: If you have MongoDB installed locally
mongod

# Option 2: Use MongoDB Compass or Atlas
# Make sure MongoDB is running on mongodb://localhost:27017
```

### Step 2: Start Backend Server
```bash
cd backend
npm install
npm start
```
**Backend should run on: http://localhost:5000**

### Step 3: Start Frontend
```bash
cd frontend  
npm install
npm run dev
```
**Frontend should run on: http://localhost:5173**

## 🔧 Current Issues & Solutions

### Issue: 404 Errors for API Endpoints
**Cause:** Backend server not running or wrong port
**Solution:** 
1. Fixed backend port to 5000 (was 3000)
2. Start backend server: `cd backend && npm start`

### Issue: MongoDB Connection
**Cause:** MongoDB not running locally
**Solution:**
1. Install MongoDB locally OR use MongoDB Atlas
2. Update MONGO_URI in backend/.env if needed
3. Current: `mongodb://localhost:27017/edutrack`

### Issue: Authentication Errors
**Cause:** No users in database
**Solution:**
1. Register a new teacher account at /login
2. Use role: "teacher" for full functionality

## 📋 Test Checklist

After starting both servers:

1. ✅ Visit http://localhost:5173
2. ✅ Register as teacher
3. ✅ Login successfully  
4. ✅ Create classroom (should work now)
5. ✅ Create assignment (should work now)
6. ✅ Upload material (should save to MongoDB)
7. ✅ Test doubts section

## 🔍 Debug Commands

Check if backend is running:
```bash
curl http://localhost:5000/api/health
```

Check MongoDB connection:
```bash
# In MongoDB shell
use edutrack
show collections
```

## 📞 If Still Having Issues

1. Check console logs in both terminal windows
2. Verify MongoDB is running: `ps aux | grep mongod`
3. Check if ports 5000 and 5173 are available
4. Clear browser cache and localStorage

---
**All backend routes and controllers are properly configured. The issue is just starting the services.**
