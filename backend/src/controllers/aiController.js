const fetch = globalThis.fetch;

// Helper to interact with Python AI service
async function callPythonAiService(endpoint, payload) {
  const aiUrl = process.env.PYTHON_AI_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${aiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`AI Service responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (err) {
    // We will catch this in the handlers and return 503
    throw new Error('AI_SERVICE_UNAVAILABLE');
  }
}

// POST /api/ai/predict-price
exports.predictPrice = async (req, res) => {
  try {
    const { cropType, state, district, targetDate, quantity } = req.body;
    
    if (!cropType || !state || !district || !targetDate) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    try {
      const aiData = await callPythonAiService('/predict-price', {
        cropType, state, district, targetDate, quantity
      });
      return res.json({ success: true, data: aiData });
    } catch (aiError) {
      if (aiError.message === 'AI_SERVICE_UNAVAILABLE') {
        return res.status(503).json({ success: false, message: 'AI price prediction service is currently unavailable.' });
      }
      throw aiError;
    }
  } catch (error) {
    console.error('predictPrice Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/ai/match-buyers
exports.matchBuyers = async (req, res) => {
  try {
    const { lotId } = req.body;
    
    if (!lotId) {
      return res.status(400).json({ success: false, message: 'lotId is required' });
    }

    try {
      const aiData = await callPythonAiService('/match-buyers', { lotId, farmerId: req.user._id });
      return res.json({ success: true, data: aiData });
    } catch (aiError) {
      if (aiError.message === 'AI_SERVICE_UNAVAILABLE') {
        return res.status(503).json({ success: false, message: 'AI buyer matching service is currently unavailable.' });
      }
      throw aiError;
    }
  } catch (error) {
    console.error('matchBuyers Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/ai/market-recommendation
exports.marketRecommendation = async (req, res) => {
  try {
    const { cropType, quantity, currentPrice, district, state } = req.body;
    
    if (!cropType || !currentPrice || !district || !state) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    try {
      const aiData = await callPythonAiService('/market-recommendation', {
        cropType, quantity, currentPrice, district, state
      });
      return res.json({ success: true, data: aiData });
    } catch (aiError) {
      if (aiError.message === 'AI_SERVICE_UNAVAILABLE') {
        return res.status(503).json({ success: false, message: 'AI market recommendation service is currently unavailable.' });
      }
      throw aiError;
    }
  } catch (error) {
    console.error('marketRecommendation Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
