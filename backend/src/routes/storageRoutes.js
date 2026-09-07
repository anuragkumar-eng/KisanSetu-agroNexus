const express = require('express');
const router = express.Router();
const { getNearbyStorage } = require('../controllers/storageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/nearby', authorize('farmer', 'fpo', 'admin'), getNearbyStorage);

module.exports = router;
