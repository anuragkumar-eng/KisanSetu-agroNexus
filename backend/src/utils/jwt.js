const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  }
  
  // Create token with user ID and role, expiring in 7 days
  return jwt.sign(
    { _id: userId, role },
    secret,
    { expiresIn: '7d' }
  );
};

module.exports = { generateToken };
