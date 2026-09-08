const Lot = require('../models/Lot');
const Offer = require('../models/Offer');
const MandiPrice = require('../models/MandiPrice');

// @desc    Calculate Net Realisation options for a specific lot
// @route   GET /api/net-realisation/:lotId
// @access  Private (Farmer)
exports.getNetRealisationForLot = async (req, res) => {
  try {
    const lotId = req.params.lotId;
    // Allow user to input custom flat costs for transport and storage, defaulting to 0 as requested for storage
    const transportCost = parseFloat(req.query.transportCost) || 0;
    const storageCost = parseFloat(req.query.storageCost) || 0;

    const lot = await Lot.findById(lotId);
    if (!lot) {
      return res.status(404).json({ success: false, message: 'Lot not found' });
    }

    if (lot.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view net realisation for this lot' });
    }

    const quantity = lot.quantity || 1;

    // 1. Fetch relevant Mandi Prices for this crop
    // Escape special regex characters in the crop name to support crops like "Bajra(Pearl Millet/Cumbu)"
    const escapedCropName = lot.cropName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const mandis = await MandiPrice.find({ cropName: new RegExp('^' + escapedCropName + '$', 'i') }).sort({ date: -1 }).lean();
    
    // Deduplicate by market to only get the latest price for each market
    const uniqueMandisMap = new Map();
    for (const m of mandis) {
      if (!uniqueMandisMap.has(m.market)) {
        uniqueMandisMap.set(m.market, m);
      }
    }
    const latestMandis = Array.from(uniqueMandisMap.values());

    const mandiOptions = latestMandis.map(m => {
      const price = m.modalPrice || m.price || 0;
      const gross = price * quantity;
      const net = gross - transportCost - storageCost;
      return {
        type: 'mandi',
        id: m._id,
        name: m.market,
        crop: m.cropName,
        variety: m.variety,
        sellingPrice: price,
        minPrice: m.minPrice,
        maxPrice: m.maxPrice,
        quantity,
        date: m.date,
        grossRealisation: gross,
        transportCost,
        storageCost,
        netRealisation: net
      };
    });

    // 2. Fetch active buyer offers for this lot
    const offers = await Offer.find({ lot: lotId, status: { $in: ['pending', 'countered'] } }).populate('buyer', 'name nameHi').lean();

    const buyerOptions = offers.map(o => {
      const price = o.offerPrice;
      const gross = price * quantity; // Assuming offer is for full lot, or use o.totalAmount
      const net = gross - transportCost - storageCost;
      return {
        type: 'buyer',
        id: o._id,
        name: o.buyer?.name || 'Unknown Buyer',
        crop: lot.cropName,
        sellingPrice: price,
        quantity,
        grossRealisation: gross,
        transportCost,
        storageCost,
        netRealisation: net
      };
    });

    // Combine and sort by net realisation (highest first)
    const allOptions = [...mandiOptions, ...buyerOptions].sort((a, b) => b.netRealisation - a.netRealisation);

    res.json({
      success: true,
      data: {
        lot: {
          id: lot._id,
          cropName: lot.cropName,
          quantity: lot.quantity,
          unit: lot.unit || 'Quintal'
        },
        costs: {
          transportCost,
          storageCost
        },
        mandiOptions,
        buyerOptions,
        bestOption: allOptions.length > 0 ? allOptions[0] : null
      }
    });
  } catch (error) {
    console.error('getNetRealisationForLot Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
