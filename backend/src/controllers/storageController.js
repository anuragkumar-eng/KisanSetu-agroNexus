// Using the static mock data from frontend as requested
const storageOptions = [
  {
    _id: 's1',
    name: 'HAFED Warehouse',
    nameHi: 'हैफेड वेयरहाउस',
    type: 'Government',
    location: 'Kanpur, Uttar Pradesh',
    distanceKm: 8,
    capacity: '10,000 MT',
    availableCapacity: '3,500 MT',
    ratePerMonth: 12,
    crops: ['Wheat', 'Rice', 'Maize'],
    facilities: ['Cold Storage', 'Fumigation', 'Weighbridge'],
    contact: '0184-123456',
  },
  {
    _id: 's2',
    name: 'Sharma Cold Storage',
    nameHi: 'शर्मा कोल्ड स्टोरेज',
    type: 'Private',
    location: 'Panipat, Uttar Pradesh',
    distanceKm: 22,
    capacity: '2,000 MT',
    availableCapacity: '800 MT',
    ratePerMonth: 20,
    crops: ['Potato', 'Onion', 'Tomato'],
    facilities: ['Cold Storage', 'Humidity Control'],
    contact: '9812345678',
  },
];

// @desc    Get storage and cold storage options nearby
// @route   GET /api/storage/nearby
// @access  Private (Farmer or FPO)
const getNearbyStorage = async (req, res) => {
  try {
    const { district, state, crop, maxDistance } = req.query;

    let filtered = [...storageOptions];

    // Simple static filtering matching parameters
    if (district) {
      filtered = filtered.filter(s => s.location.toLowerCase().includes(district.toLowerCase()));
    }
    if (state) {
      filtered = filtered.filter(s => s.location.toLowerCase().includes(state.toLowerCase()));
    }
    if (crop) {
      filtered = filtered.filter(s => s.crops.some(c => c.toLowerCase() === crop.toLowerCase()));
    }
    if (maxDistance) {
      const maxD = Number(maxDistance);
      filtered = filtered.filter(s => s.distanceKm <= maxD);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getNearbyStorage
};
