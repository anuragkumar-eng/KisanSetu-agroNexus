const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['payment', 'quality', 'transport', 'fraud', 'other'], required: true, default: 'other' },
  subject: { type: String, required: true },
  subjectHi: { type: String },
  description: { type: String, required: true },
  relatedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  relatedOfferId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' }
}, { timestamps: true });

grievanceSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Grievance', grievanceSchema);
