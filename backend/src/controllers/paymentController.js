const Order = require('../models/Order');

// @desc    Get payment summary and history for a specific order
// @route   GET /api/payments/:orderId
// @access  Private (Farmer or Buyer)
const getOrderPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    const isFarmer = order.farmer.toString() === req.user._id.toString();
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isBuyer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view payment details for this order' });
    }

    // Determine derived payment information based on order status/contract
    // If order is PAYMENT_RECEIVED or completed/paid in some flow, amountPaid is totalAmount.
    // In our order state machine, PAYMENT_RECEIVED marks full payment.
    const isPaid = order.status === 'PAYMENT_RECEIVED';
    const amountPaid = isPaid ? order.totalAmount : 0;
    const amountDue = isPaid ? 0 : order.totalAmount;

    res.json({
      success: true,
      data: {
        orderId: order._id,
        totalAmount: order.totalAmount,
        amountPaid,
        amountDue,
        paymentStatus: isPaid ? 'paid' : 'pending',
        paymentTerms: 'Full payment on delivery',
        transactions: isPaid ? [
          {
            id: `txn_${Date.now()}`,
            amount: order.totalAmount,
            method: 'Bank Transfer',
            date: order.updatedAt,
            status: 'successful'
          }
        ] : []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrderPayment
};
