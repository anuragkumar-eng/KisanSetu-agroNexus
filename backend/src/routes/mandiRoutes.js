const express = require('express');
const router = express.Router();
const { getMandiPrices, getMandiPriceById, getMandiHistory, getMandiHistoryByCrop } = require('../controllers/mandiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All mandi routes require authentication

router.route('/')
  .get(getMandiPrices);

router.route('/crop/:crop/history')
  .get(getMandiHistoryByCrop);

router.route('/:id')
  .get(getMandiPriceById);

router.route('/:id/history')
  .get(getMandiHistory);

module.exports = router;
