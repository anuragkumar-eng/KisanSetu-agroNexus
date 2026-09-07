const BuyerRequirement = require('../models/BuyerRequirement');

// @desc    Create a new buying requirement
// @route   POST /api/requirements
// @access  Private (Buyer only)
const createRequirement = async (req, res) => {
  try {
    const { cropName, minQuantity, preferredQuality, expectedPrice, location } = req.body;

    if (!cropName || !minQuantity) {
      return res.status(400).json({ success: false, message: 'cropName and minQuantity are required' });
    }

    const requirement = await BuyerRequirement.create({
      buyer: req.user._id, // Enforce authenticated user as the buyer
      cropName,
      minQuantity,
      preferredQuality,
      expectedPrice,
      location,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: requirement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get buyer requirements
// @route   GET /api/requirements
// @access  Private (Farmer, FPO, Admin, or Buyer for their own)
const getRequirements = async (req, res) => {
  try {
    const { crop, state, minQty, limit } = req.query;

    const query = { status: 'active' };

    // If a buyer calls this, only return their own requirements
    if (req.user.role === 'buyer') {
      query.buyer = req.user._id;
      // Buyers might want to see 'fulfilled' or 'closed' too, but let's stick to active by default
    }

    if (crop) query.cropName = new RegExp(crop, 'i');
    if (state) query.location = new RegExp(state, 'i');
    if (minQty) query.minQuantity = { $gte: Number(minQty) };

    const pageSize = parseInt(limit, 10) || 20;

    const requirements = await BuyerRequirement.find(query)
      .populate('buyer', 'name company location rating verified')
      .sort({ createdAt: -1 })
      .limit(pageSize);

    res.json({
      success: true,
      data: requirements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single requirement by ID
// @route   GET /api/requirements/:id
// @access  Private (Any role)
const getRequirementById = async (req, res) => {
  try {
    const requirement = await BuyerRequirement.findById(req.params.id)
      .populate('buyer', 'name company location rating verified');

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    res.json({
      success: true,
      data: requirement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a requirement
// @route   PATCH /api/requirements/:id
// @access  Private (Buyer only, owner only)
const updateRequirement = async (req, res) => {
  try {
    const requirement = await BuyerRequirement.findById(req.params.id);

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    // Verify ownership
    if (requirement.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this requirement' });
    }

    // Prevent changing the buyer reference
    delete req.body.buyer;

    const updatedRequirement = await BuyerRequirement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedRequirement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete (soft-delete or permanent) a requirement
// @route   DELETE /api/requirements/:id
// @access  Private (Buyer only, owner only)
const deleteRequirement = async (req, res) => {
  try {
    const requirement = await BuyerRequirement.findById(req.params.id);

    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    // Verify ownership
    if (requirement.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this requirement' });
    }

    // The API.md mentions soft-delete. Let's just set status to 'closed'.
    requirement.status = 'closed';
    await requirement.save();

    res.json({
      success: true,
      data: { message: 'Requirement deleted (closed)' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRequirement,
  getRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement
};
