const mongoose = require('mongoose');

const buyerRequirementSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true },
  minQuantity: { type: Number, required: true },
  preferredQuality: { type: String },
  expectedPrice: { type: Number },
  location: { type: String },
  status: { type: String, enum: ['active', 'fulfilled', 'closed'], default: 'active' }
}, { timestamps: true });

buyerRequirementSchema.index({ status: 1, cropName: 1 });
buyerRequirementSchema.index({ buyer: 1 });

module.exports = mongoose.model('BuyerRequirement', buyerRequirementSchema);
