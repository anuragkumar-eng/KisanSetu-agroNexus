// backend/src/controllers/marketController.js

// POST /api/market/net-value
exports.calculateNetValue = async (req, res) => {
  try {
    const { cropType, quantity = 1, sellingPrice = 0, fromDistrict, toDistrict, storageMonths = 0 } = req.body;
    
    if (!cropType || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid cropType or quantity' });
    }

    const grossValue = quantity * sellingPrice;
    
    // In a real app, these would come from transport/storage models or external APIs.
    // We follow the project specification's pricing structure.
    const transportCost = 3500; // Simulated flat rate for now
    const storageCost = Math.round(storageMonths * quantity * 12);
    const commissionFee = Math.round(grossValue * 0.01);
    const loadingUnloading = 500;
    const miscCharges = 200;
    
    // Total deductions
    const totalDeductions = transportCost + storageCost + commissionFee + loadingUnloading + miscCharges;
    
    // Net
    const estimatedNetValue = grossValue - totalDeductions;
    const netPricePerQuintal = Math.round(estimatedNetValue / quantity);

    return res.json({
      success: true,
      data: {
        grossValue,
        deductions: {
          transportCost,
          storageCost,
          commissionFee,
          loadingUnloading,
          miscCharges
        },
        totalDeductions,
        estimatedNetValue,
        netPricePerQuintal,
        breakdownHi: {
          'परिवहन': transportCost,
          'भंडारण': storageCost,
          'कमीशन': commissionFee,
          'लोडिंग-अनलोडिंग': loadingUnloading,
          'अन्य': miscCharges
        }
      }
    });

  } catch (error) {
    console.error('calculateNetValue Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
