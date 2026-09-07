const mongoose = require('mongoose');

const mandiPriceSchema = new mongoose.Schema({
  cropName: { type: String, required: true },
  variety: { type: String, default: 'Common' }, // Added for Phase 8B
  state: { type: String, required: true },
  district: { type: String, required: true },
  market: { type: String, required: true },
  
  minPrice: { type: Number },                   // Added for Phase 8B
  maxPrice: { type: Number },                   // Added for Phase 8B
  modalPrice: { type: Number },                 // Added for Phase 8B
  price: { type: Number, required: true },      // Legacy/fallback modal price
  
  unit: { type: String, default: 'Quintal' },   // Added for Phase 8B
  date: { type: Date, required: true }
}, { timestamps: true });

// Compound index for finding recent prices for a crop in a district
mandiPriceSchema.index({ cropName: 1, district: 1, date: -1 });

module.exports = mongoose.model('MandiPrice', mandiPriceSchema);
