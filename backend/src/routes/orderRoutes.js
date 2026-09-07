const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All order routes require authentication

router.route('/')
  .get(getOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .patch(updateOrderStatus);

module.exports = router;
