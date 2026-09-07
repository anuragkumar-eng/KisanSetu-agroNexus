const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT and attach user to req.user
 */
const protect = async (req, res, next) => {
  let token;

  // Check if header exists and starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
      }
      const decoded = jwt.verify(token, secret);

      // Find user and attach to request (excluding password)
      req.user = await User.findById(decoded._id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found / invalid token' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param  {...string} roles - allowed roles (e.g., 'farmer', 'buyer', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
