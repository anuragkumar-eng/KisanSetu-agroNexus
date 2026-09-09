const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 } // TTL index! expires when current time >= expiresAt
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
