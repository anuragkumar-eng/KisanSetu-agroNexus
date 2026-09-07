const MandiPrice = require('../models/MandiPrice');

// @desc    Get current mandi prices
// @route   GET /api/mandi
// @access  Private (auth required)
const getMandiPrices = async (req, res) => {
  try {
    const { crop, state, district, market, date, limit } = req.query;

    const query = {};
    if (crop) query.cropName = new RegExp(crop, 'i');
    if (state) query.state = new RegExp(state, 'i');
    if (district) query.district = new RegExp(district, 'i');
    if (market) query.market = new RegExp(market, 'i');

    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(targetDate.getDate() + 1);
      query.date = { $gte: targetDate, $lt: nextDate };
    }

    const pageSize = parseInt(limit, 10) || 20;

    const prices = await MandiPrice.find(query)
      .sort({ date: -1 })
      .limit(pageSize);

    res.json({
      success: true,
      data: prices
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single mandi price record by ID
// @route   GET /api/mandi/:id
// @access  Private
const getMandiPriceById = async (req, res) => {
  try {
    const price = await MandiPrice.findById(req.params.id);
    if (!price) {
      return res.status(404).json({ success: false, message: 'Mandi record not found' });
    }
    res.json({ success: true, data: price });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get historical price data for a specific mandi/crop entry
// @route   GET /api/mandi/:id/history
// @access  Private
const getMandiHistory = async (req, res) => {
  try {
    const record = await MandiPrice.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Mandi record not found' });
    }

    const days = parseInt(req.query.days, 10) || 14;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const history = await MandiPrice.find({
      cropName: record.cropName,
      market: record.market,
      district: record.district,
      date: { $gte: cutoffDate }
    }).sort({ date: 1 }); // Oldest to newest for charts

    res.json({
      success: true,
      data: {
        cropName: record.cropName,
        market: record.market,
        district: record.district,
        state: record.state,
        prices: history.map(h => ({
          date: h.date,
          price: h.price
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get historical price data by crop name
// @route   GET /api/mandi/crop/:crop/history
// @access  Private
const getMandiHistoryByCrop = async (req, res) => {
  try {
    // robust handling of spaces/special characters
    const cropNameRaw = decodeURIComponent(req.params.crop);
    // escape regex characters if needed, though simple names are standard
    const cropRegex = new RegExp(`^${cropNameRaw.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');

    const days = parseInt(req.query.days, 10) || 14;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Find the latest record to pin the trend to a specific market
    const latestRecord = await MandiPrice.findOne({ cropName: cropRegex }).sort({ date: -1 });

    let historyRecords = [];
    if (latestRecord) {
      historyRecords = await MandiPrice.find({
        cropName: cropRegex,
        market: latestRecord.market,
        district: latestRecord.district,
        date: { $gte: cutoffDate }
      }).sort({ date: 1 });
    }

    res.json({
      success: true,
      data: {
        history: historyRecords.map(h => h.price || h.modalPrice)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMandiPrices,
  getMandiPriceById,
  getMandiHistory,
  getMandiHistoryByCrop
};
