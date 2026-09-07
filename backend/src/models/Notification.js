const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  icon: { type: String },
  title: { type: String, required: true },
  titleHi: { type: String },
  message: { type: String, required: true },
  messageHi: { type: String },
  type: { type: String, enum: ['offer', 'order', 'system', 'payment', 'price'], default: 'system' },
  read: { type: Boolean, default: false },
  farmerLink: { type: String },
  buyerLink: { type: String }
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
