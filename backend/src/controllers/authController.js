const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password, role, name, ...additionalFields } = req.body;

    // Validate input
    if (!username || !email || !password || !role || !name) {
      return res.status(400).json({ 
        success: false,
        error: 'Username, email, password, role, and name are required' 
      });
    }

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        error: 'Role must be either student or teacher' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists in both collections
    const existingTeacher = await Teacher.findOne({ $or: [{ email }, { username }] });
    const existingStudent = await Student.findOne({ $or: [{ email }, { username }] });

    if (existingTeacher || existingStudent) {
      return res.status(400).json({ 
        success: false,
        error: 'User with this email or username already exists' 
      });
    }

    // Create new user based on role
    let user;
    const userData = { username, email, password, name, ...additionalFields };
    
    if (role === 'teacher') {
      user = new Teacher(userData);
    } else {
      user = new Student(userData);
    }
    
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id, role);

    // Set session
    req.session.userId = user._id;
    req.session.userRole = role;

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      data: {
        user: { ...user.toJSON(), role },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        error: 'Email, password, and role are required' 
      });
    }

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        error: 'Role must be either student or teacher' 
      });
    }

    // Find user by email and role
    let user;
    if (role === 'teacher') {
      user = await Teacher.findOne({ email }).select('+password');
    } else {
      user = await Student.findOne({ email }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not Found. Please Register.' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, role);

    // Set session
    req.session.userId = user._id;
    req.session.userRole = role;

    // Remove password from user object
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { ...user.toJSON(), role },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ 
          success: false,
          error: 'Could not log out' 
        });
      }
      
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({ 
        success: true,
        message: 'Logout successful' 
      });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// Get current user profile
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
        authMethod: req.authMethod
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
