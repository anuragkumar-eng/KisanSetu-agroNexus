const express = require('express');
const router = express.Router();
const { registerUser, loginUser, phoneLogin, getMe, logoutUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/phone-login', phoneLogin);
router.post('/logout', logoutUser);

// Protected route
router.get('/me', protect, getMe);

// Example of role-protected route (not required for Phase 5C but good for testing)
// router.get('/admin-only', protect, authorize('admin'), (req, res) => res.json({ success: true, message: 'Admin access granted' }));

module.exports = router;
