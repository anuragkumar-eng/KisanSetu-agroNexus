const Lot = require('../models/Lot');

// @desc    Create a new lot
// @route   POST /api/lots
// @access  Private (Farmer only)
const createLot = async (req, res) => {
  try {
    const { cropName, cropNameHi, quantity, askingPrice, quality, qualityHi, location, locationHi, description, descriptionHi, unit, unitHi } = req.body;

    // Basic validation
    if (!cropName || !quantity || !askingPrice) {
      return res.status(400).json({ success: false, message: 'Missing required fields: cropName, quantity, askingPrice' });
    }

    // Set farmer from authenticated user, ignore any farmerId in body
    const lot = await Lot.create({
      farmer: req.user._id,
      cropName,
      cropNameHi,
      quantity,
      askingPrice,
      quality,
      qualityHi,
      location,
      locationHi,
      description,
      descriptionHi,
      unit: unit || 'quintal',
      unitHi,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: lot
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all marketplace lots (active only)
// @route   GET /api/lots
// @access  Private
const getMarketplaceLots = async (req, res) => {
  try {
    const { crop, minQuantity, maxPrice, state, district } = req.query;

    const query = { status: 'active' };
    if (crop) query.cropName = new RegExp(crop, 'i');
    if (minQuantity) query.quantity = { $gte: Number(minQuantity) };
    if (maxPrice) query.askingPrice = { $lte: Number(maxPrice) };
    if (state) query.location = new RegExp(state, 'i');
    if (district) query.location = new RegExp(district, 'i');

    const lots = await Lot.find(query)
      .populate('farmer', 'name nameHi avatar rating verified location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: lots
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in farmer's lots
// @route   GET /api/lots/my
// @access  Private (Farmer only)
const getMyLots = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { farmer: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const lots = await Lot.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: lots
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get lot by ID
// @route   GET /api/lots/:id
// @access  Private
const getLotById = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id).populate('farmer', 'name nameHi avatar rating verified location');
    
    if (!lot) {
      return res.status(404).json({ success: false, message: 'Lot not found' });
    }
    
    res.json({
      success: true,
      data: lot
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a lot
// @route   PATCH /api/lots/:id
// @access  Private (Owner only)
const updateLot = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({ success: false, message: 'Lot not found' });
    }

    // Verify ownership
    if (lot.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this lot' });
    }

    // Do not allow ownership change
    delete req.body.farmer;
    
    const updatedLot = await Lot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedLot
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a lot
// @route   DELETE /api/lots/:id
// @access  Private (Owner only)
const deleteLot = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id);

    if (!lot) {
      return res.status(404).json({ success: false, message: 'Lot not found' });
    }

    // Verify ownership
    if (lot.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this lot' });
    }

    await lot.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createLot,
  getMarketplaceLots,
  getMyLots,
  getLotById,
  updateLot,
  deleteLot
};
