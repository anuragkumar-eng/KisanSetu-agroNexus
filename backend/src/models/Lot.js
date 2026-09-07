const mongoose = require('mongoose');

const lotSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true },
  cropNameHi: { type: String },
  cropEmoji: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'quintal' },
  unitHi: { type: String },
  askingPrice: { type: Number, required: true }, // per unit
  quality: { type: String },
  qualityHi: { type: String },
  location: { type: String },
  locationHi: { type: String },
  description: { type: String },
  descriptionHi: { type: String },
  status: { type: String, enum: ['active', 'sold', 'expired', 'draft'], default: 'active' },
  expiresAt: { type: Date },
  images: [{ type: String }]
}, { timestamps: true });

// Indexes for common queries
lotSchema.index({ farmer: 1, status: 1 });
lotSchema.index({ status: 1, cropName: 1 });

module.exports = mongoose.model('Lot', lotSchema);
