const express = require('express');
const router = express.Router();
const { getOrderPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/:orderId', getOrderPayment);

module.exports = router;
