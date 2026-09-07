const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  lot: { type: mongoose.Schema.Types.ObjectId, ref: 'Lot', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offerPrice: { type: Number, required: true }, // per unit
  counterPrice: { type: Number }, // added for countered status
  quantity: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  message: { type: String },
  messageHi: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed', 'countered'], default: 'pending' },
  validUntil: { type: Date }
}, { timestamps: true });

offerSchema.index({ farmer: 1, status: 1 });
offerSchema.index({ buyer: 1, status: 1 });
offerSchema.index({ lot: 1 });

module.exports = mongoose.model('Offer', offerSchema);
