const Offer = require('../models/Offer');
const Lot = require('../models/Lot');
const Order = require('../models/Order');

// @desc    Make an offer on a farmer's lot
// @route   POST /api/offers
// @access  Private (Buyer)
const createOffer = async (req, res) => {
  try {
    const { lotId, offerPrice, quantity, message, messageHi, validUntil } = req.body;

    if (!lotId || !offerPrice || !quantity) {
      return res.status(400).json({ success: false, message: 'lotId, offerPrice, and quantity are required' });
    }

    const lot = await Lot.findById(lotId);
    if (!lot) {
      return res.status(404).json({ success: false, message: 'Lot not found' });
    }

    if (lot.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Offers can only be made on active lots' });
    }

    if (quantity > lot.quantity) {
      return res.status(400).json({ success: false, message: 'Offer quantity exceeds available lot quantity' });
    }

    const totalAmount = offerPrice * quantity;

    const offer = await Offer.create({
      lot: lotId,
      farmer: lot.farmer,
      buyer: req.user._id, // Enforce logged-in buyer
      offerPrice,
      quantity,
      totalAmount,
      message,
      messageHi,
      validUntil
    });

    res.status(201).json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get offers received by the farmer
// @route   GET /api/offers/farmer
// @access  Private (Farmer)
const getFarmerOffers = async (req, res) => {
  try {
    const { status, lotId, limit } = req.query;

    const query = { farmer: req.user._id };
    if (status) query.status = status;
    if (lotId) query.lot = lotId;

    const pageSize = parseInt(limit, 10) || 20;

    const offers = await Offer.find(query)
      .populate('buyer', 'name company rating verified')
      .populate('lot', 'cropName cropEmoji quantity askingPrice status')
      .sort({ createdAt: -1 })
      .limit(pageSize);

    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get offers sent by the buyer
// @route   GET /api/offers/buyer
// @access  Private (Buyer)
const getBuyerOffers = async (req, res) => {
  try {
    const { status, limit } = req.query;

    const query = { buyer: req.user._id };
    if (status) query.status = status;

    const pageSize = parseInt(limit, 10) || 20;

    const offers = await Offer.find(query)
      .populate('farmer', 'name location verified')
      .populate('lot', 'cropName cropEmoji quantity askingPrice status')
      .sort({ createdAt: -1 })
      .limit(pageSize);

    res.json({
      success: true,
      data: offers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single offer by ID
// @route   GET /api/offers/:id
// @access  Private
const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('farmer', 'name location verified')
      .populate('buyer', 'name company rating verified')
      .populate('lot', 'cropName cropEmoji quantity askingPrice status');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Authorization check
    const isFarmer = req.user._id.toString() === offer.farmer._id.toString();
    const isBuyer = req.user._id.toString() === offer.buyer._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isBuyer && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this offer' });
    }

    res.json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept an offer
// @route   PATCH /api/offers/:id/accept
// @access  Private (Farmer)
const acceptOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept this offer' });
    }

    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return res.status(400).json({ success: false, message: 'Offer is not in an actionable state' });
    }

    const lot = await Lot.findById(offer.lot);
    if (!lot || lot.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Lot is no longer active or available' });
    }

    // Update Offer Status
    offer.status = 'accepted';
    await offer.save();

    // Update Lot Status to prevent multiple accepted offers
    lot.status = 'sold';
    await lot.save();

    // Create Order
    const order = await Order.create({
      offer: offer._id,
      lot: lot._id,
      farmer: offer.farmer,
      buyer: offer.buyer,
      cropName: lot.cropName,
      cropNameHi: lot.cropNameHi,
      cropEmoji: lot.cropEmoji,
      quantity: offer.quantity,
      unit: lot.unit,
      pricePerUnit: offer.counterPrice || offer.offerPrice,
      totalAmount: (offer.counterPrice || offer.offerPrice) * offer.quantity,
      status: 'ORDER_CONFIRMED'
    });

    res.json({
      success: true,
      data: {
        offer,
        order
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject an offer
// @route   PATCH /api/offers/:id/reject
// @access  Private (Farmer)
const rejectOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this offer' });
    }

    if (offer.status !== 'pending' && offer.status !== 'countered') {
      return res.status(400).json({ success: false, message: 'Offer is not in an actionable state' });
    }

    offer.status = 'rejected';
    await offer.save();

    res.json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Counter an offer
// @route   PATCH /api/offers/:id/counter
// @access  Private (Farmer)
const counterOffer = async (req, res) => {
  try {
    const { counterPrice, message } = req.body;

    if (!counterPrice) {
      return res.status(400).json({ success: false, message: 'Counter price is required' });
    }

    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to counter this offer' });
    }

    if (offer.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Offer is not in an actionable state' });
    }

    offer.status = 'countered';
    offer.counterPrice = counterPrice;
    if (message) {
      // Depending on structure, we might append or just use this as a note
      // Will just store it in the offer context or overwrite for simplicity if schema isn't robust
      // The API contract didn't specify array of messages, so we just overwrite or ignore
      // A full app might have a messages array. We'll update the main message for now, or just leave it.
      // We don't have a specific `counterMessage` field. Let's just update `message` or add a note.
      offer.message = message;
    }

    // totalAmount could be updated, but usually it's calculated at order time. Let's leave totalAmount as the original buyer's total.
    
    await offer.save();

    res.json({
      success: true,
      data: offer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOffer,
  getFarmerOffers,
  getBuyerOffers,
  getOfferById,
  acceptOffer,
  rejectOffer,
  counterOffer
};
