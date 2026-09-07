const express = require('express');
const router = express.Router();
const { getNetRealisationForLot } = require('../controllers/netRealisationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/:lotId', protect, authorize('farmer'), getNetRealisationForLot);

module.exports = router;
