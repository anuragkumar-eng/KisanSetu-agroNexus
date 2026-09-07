const Order = require('../models/Order');

// @desc    Get all orders for the authenticated user
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const { status, limit } = req.query;

    const query = {};

    // Role-based filtering
    if (req.user.role === 'farmer') {
      query.farmer = req.user._id;
    } else if (req.user.role === 'buyer') {
      query.buyer = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin sees all, or can filter by specific query if needed, but for now sees all
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized to view orders' });
    }

    if (status) {
      query.status = status;
    }

    const pageSize = parseInt(limit, 10) || 20;

    const orders = await Order.find(query)
      .populate('farmer', 'name nameHi location verified')
      .populate('buyer', 'name company location rating verified')
      .populate('lot', 'cropName cropEmoji quantity askingPrice status location')
      .sort({ createdAt: -1 })
      .limit(pageSize);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmer', 'name nameHi location verified')
      .populate('buyer', 'name company location rating verified')
      .populate('lot', 'cropName cropEmoji location');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isFarmer = order.farmer._id.toString() === req.user._id.toString();
    const isBuyer = order.buyer._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isBuyer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order delivery/payment status
// @route   PATCH /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, expectedDelivery, logisticsProvider, trackingId } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role & Ownership check setup
    const isFarmer = order.farmer.toString() === req.user._id.toString();
    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // State machine definition matching docs/API.md
    /*
      ORDER_CONFIRMED: System (on offer accept)
      TRANSPORT_PENDING: farmer
      PICKED_UP: farmer / logistics
      IN_TRANSIT: farmer / logistics
      DELIVERED: buyer
      PAYMENT_PENDING: System (Wait, API.md says "System | Delivery confirmed, payment awaited". We might auto-transition to this if DELIVERED, or allow admin to set it)
      PAYMENT_RECEIVED: buyer / admin
    */
    
    let authorized = false;

    // Validate Transition and Authority
    if (status === 'TRANSPORT_PENDING') {
      if (isFarmer || isAdmin) {
        if (order.status === 'ORDER_CONFIRMED') authorized = true;
      }
    } else if (status === 'PICKED_UP') {
      if (isFarmer || isAdmin) {
        if (['ORDER_CONFIRMED', 'TRANSPORT_PENDING'].includes(order.status)) authorized = true;
      }
    } else if (status === 'IN_TRANSIT') {
      if (isFarmer || isAdmin) {
        if (['PICKED_UP', 'TRANSPORT_PENDING'].includes(order.status)) authorized = true;
      }
    } else if (status === 'DELIVERED') {
      if (isBuyer || isAdmin) {
        if (['IN_TRANSIT', 'PICKED_UP'].includes(order.status)) authorized = true;
      }
    } else if (status === 'PAYMENT_PENDING') {
      // API.md says System, but let's allow admin or transition automatically. We will allow admin.
      if (isAdmin) {
        authorized = true;
      }
    } else if (status === 'PAYMENT_RECEIVED') {
      if (isBuyer || isAdmin) {
        if (['DELIVERED', 'PAYMENT_PENDING'].includes(order.status)) authorized = true;
      }
    }

    if (!authorized) {
      return res.status(403).json({ 
        success: false, 
        message: 'INVALID_STATUS_TRANSITION: Transition not allowed by state machine or insufficient permissions.' 
      });
    }

    order.status = status;
    
    // Auto-transition to PAYMENT_PENDING if DELIVERED is set by buyer, to match "System" docs
    if (status === 'DELIVERED') {
      order.status = 'PAYMENT_PENDING'; 
      // the frontend might expect DELIVERED for a moment, but PAYMENT_PENDING is the logical next step.
      // We will actually just set it to DELIVERED and let the next state be PAYMENT_PENDING if needed, 
      // or we can set it to PAYMENT_PENDING straight away. Let's just set it to what they asked.
      order.status = status; // Revert auto-jump for purity, they can jump to PAYMENT_RECEIVED anyway.
    }

    if (note) order.note = note;
    if (expectedDelivery) order.expectedDelivery = expectedDelivery;
    if (logisticsProvider) order.logisticsProvider = logisticsProvider;
    if (trackingId) order.trackingId = trackingId;

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus
};
