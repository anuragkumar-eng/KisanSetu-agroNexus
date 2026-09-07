const express = require('express');
const router = express.Router();
const { getTransportOptions, arrangeTransport } = require('../controllers/transportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/options', authorize('farmer', 'fpo', 'admin'), getTransportOptions);
router.post('/arrange', authorize('farmer', 'fpo', 'admin'), arrangeTransport);

module.exports = router;
