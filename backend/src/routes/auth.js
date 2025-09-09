const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Logout route (requires authentication)
router.post('/logout', authenticate, logout);

// Get current user profile (requires authentication)
router.get('/me', authenticate, getMe);

module.exports = router;
