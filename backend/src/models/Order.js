const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  lot: { type: mongoose.Schema.Types.ObjectId, ref: 'Lot', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String },
  cropNameHi: { type: String },
  cropEmoji: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'quintal' },
  pricePerUnit: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: [
      'ORDER_CONFIRMED', 
      'TRANSPORT_PENDING', 
      'PICKED_UP', 
      'IN_TRANSIT', 
      'DELIVERED', 
      'PAYMENT_PENDING', 
      'PAYMENT_RECEIVED'
    ], 
    default: 'ORDER_CONFIRMED' 
  },
  note: { type: String },
  expectedDelivery: { type: Date },
  logisticsProvider: { type: String },
  trackingId: { type: String }
}, { timestamps: true });

orderSchema.index({ farmer: 1, status: 1 });
orderSchema.index({ buyer: 1, status: 1 });

module.exports = mongoose.model('Order', orderSchema);
