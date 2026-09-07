const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/predict-price', protect, authorize('farmer', 'fpo'), aiController.predictPrice);
router.post('/match-buyers', protect, authorize('farmer', 'fpo'), aiController.matchBuyers);
router.post('/market-recommendation', protect, authorize('farmer', 'fpo'), aiController.marketRecommendation);

module.exports = router;
