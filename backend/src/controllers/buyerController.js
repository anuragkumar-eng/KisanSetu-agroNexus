const User = require('../models/User');

// @desc    Get all buyers
// @route   GET /api/buyers
// @access  Private
const getBuyers = async (req, res) => {
  try {
    const { crop, state, minRating, verified, limit } = req.query;

    const query = { role: 'buyer' };
    
    // In our simplified schema, buyers' interested crops might be stored in a 'crops' array 
    // or through BuyerRequirements. The API.md mock shows crops array for buyers too.
    if (crop) query.crops = new RegExp(crop, 'i');
    if (state) query.state = new RegExp(state, 'i');
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (verified === 'true') query.verified = true;

    const pageSize = parseInt(limit, 10) || 20;

    const buyers = await User.find(query)
      .select('-password -__v -email -phone') // Don't expose private fields unnecessarily
      .limit(pageSize);

    res.json({
      success: true,
      data: buyers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single buyer profile
// @route   GET /api/buyers/:id
// @access  Private
const getBuyerById = async (req, res) => {
  try {
    const buyer = await User.findOne({ _id: req.params.id, role: 'buyer' })
      .select('-password -__v');

    if (!buyer) {
      return res.status(404).json({ success: false, message: 'Buyer not found' });
    }

    res.json({
      success: true,
      data: buyer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBuyers,
  getBuyerById
};
