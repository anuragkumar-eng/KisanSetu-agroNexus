const Order = require('../models/Order');

// Static transport options based on frontend mock data
const transportOptions = [
  {
    _id: "tr_001",
    providerName: "KisanSetu Logistics",
    providerNameHi: "KisanSetu Logistics",
    vehicleType: "Mini Truck",
    vehicleTypeHi: "Mini Truck",
    capacityQuintals: 40,
    ratePerKm: 15,
    estimatedCost: 1200,
    rating: 4.8
  },
  {
    _id: "tr_002",
    providerName: "Farmer Own Transport",
    providerNameHi: "Farmer Own Transport",
    vehicleType: "Tractor Trailer",
    vehicleTypeHi: "Tractor Trailer",
    capacityQuintals: 60,
    ratePerKm: 12,
    estimatedCost: 960,
    rating: 4.5
  },
  {
    _id: "tr_003",
    providerName: "Fast Freight Services",
    providerNameHi: "Fast Freight Services",
    vehicleType: "Heavy Truck",
    vehicleTypeHi: "Heavy Truck",
    capacityQuintals: 150,
    ratePerKm: 25,
    estimatedCost: 2000,
    rating: 4.2
  }
];

// @desc    Get available transport/logistics options
// @route   GET /api/transport/options
// @access  Private (Farmer or FPO)
const getTransportOptions = async (req, res) => {
  try {
    // We are implementing static configuration matching docs/API.md
    // Optional filters could be applied here if needed:
    // const { fromDistrict, toDistrict, quantity, date } = req.query;

    res.json({
      success: true,
      data: transportOptions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Book transport for a specific order
// @route   POST /api/transport/arrange
// @access  Private (Farmer or FPO)
const arrangeTransport = async (req, res) => {
  try {
    const { orderId, transporterId, pickupDate, pickupAddress } = req.body;

    if (!orderId || !transporterId || !pickupDate) {
      return res.status(400).json({ success: false, message: 'orderId, transporterId, and pickupDate are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (order.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to arrange transport for this order' });
    }

    // Find provider
    const provider = transportOptions.find(t => t._id === transporterId);
    if (!provider) {
      return res.status(400).json({ success: false, message: 'Invalid transporterId' });
    }

    // Update order status and logistics info
    order.status = 'TRANSPORT_PENDING';
    order.logisticsProvider = provider.providerName;
    order.trackingId = `KS-TRK-${Math.floor(1000 + Math.random() * 9000)}`;
    // If pickupAddress is given, we could store it, but schema just has expectedDelivery and logisticsProvider
    await order.save();

    res.status(201).json({
      success: true,
      data: {
        bookingId: `BKG-${Date.now()}`,
        trackingId: order.trackingId,
        provider: provider.providerName,
        pickupDate: pickupDate,
        status: 'confirmed'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTransportOptions,
  arrangeTransport
};
