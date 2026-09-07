const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/net-value', protect, authorize('farmer', 'fpo'), marketController.calculateNetValue);

module.exports = router;
