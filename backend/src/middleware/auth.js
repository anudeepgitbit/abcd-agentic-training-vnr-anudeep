const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// Helper function to find user by ID and role
const findUserByIdAndRole = async (userId, role) => {
  if (role === 'teacher') {
    return await Teacher.findById(userId);
  } else if (role === 'student') {
    return await Student.findById(userId);
  }
  return null;
};

// Middleware to verify JWT token
const verifyJWT = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserByIdAndRole(decoded.userId, decoded.role);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token. User not found.' 
      });
    }

    req.user = { ...user.toJSON(), role: decoded.role };
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: 'Invalid token.' 
    });
  }
};

// Middleware to verify session
const verifySession = async (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole) {
    try {
      const user = await findUserByIdAndRole(req.session.userId, req.session.userRole);
      if (user) {
        req.user = { ...user.toJSON(), role: req.session.userRole };
        req.userRole = req.session.userRole;
        return next();
      }
    } catch (error) {
      // Session user lookup failed
    }
  }
  return res.status(401).json({ 
    success: false,
    error: 'Access denied. No valid session.' 
  });
};

// Middleware that accepts either JWT or session authentication
const authenticate = async (req, res, next) => {
  // First try JWT authentication
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await findUserByIdAndRole(decoded.userId, decoded.role);
      
      if (user) {
        req.user = { ...user.toJSON(), role: decoded.role };
        req.userRole = decoded.role;
        req.authMethod = 'jwt';
        return next();
      }
    } catch (error) {
      // JWT failed, continue to session check
    }
  }

  // If JWT fails or no token, try session authentication
  if (req.session && req.session.userId && req.session.userRole) {
    try {
      const user = await findUserByIdAndRole(req.session.userId, req.session.userRole);
      if (user) {
        req.user = { ...user.toJSON(), role: req.session.userRole };
        req.userRole = req.session.userRole;
        req.authMethod = 'session';
        return next();
      }
    } catch (error) {
      // Session user lookup failed
    }
  }

  // Both authentication methods failed
  return res.status(401).json({ 
    success: false,
    error: 'Access denied. Please login.' 
  });
};

// Middleware to check if user has required role
const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.userRole || req.userRole !== requiredRole) {
      return res.status(403).json({ 
        success: false,
        error: `Access denied. ${requiredRole} role required.` 
      });
    }
    next();
  };
};

module.exports = {
  verifyJWT,
  verifySession,
  authenticate,
  requireRole,
  findUserByIdAndRole
};
