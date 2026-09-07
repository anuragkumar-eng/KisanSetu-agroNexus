const express = require('express');
const router = express.Router();
const { getBuyers, getBuyerById } = require('../controllers/buyerController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All buyer routes require authentication

router.route('/')
  .get(authorize('farmer', 'admin'), getBuyers);

router.route('/:id')
  .get(getBuyerById); // Any authenticated user can view a profile

module.exports = router;
