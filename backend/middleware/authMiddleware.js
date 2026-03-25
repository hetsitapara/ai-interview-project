const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { secretKey } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, secretKey);

      // Get user from the token
      req.user = await User.findById(decoded.id);

      // Remove password from request user object if needed (not strictly necessary for this file-DB but good practice)
      if (req.user) {
         delete req.user.password;
      }

       return next();
    } catch (error) {
      console.error('[AuthMiddleware] Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized: ' + error.message });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
