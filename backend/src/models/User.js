const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'buyer', 'admin'], required: true },
  
  // Common fields
  name: { type: String, required: true },
  nameHi: { type: String },
  phone: { type: String },
  avatar: { type: String },
  location: { type: String },
  locationHi: { type: String },
  state: { type: String },
  district: { type: String },
  memberSince: { type: String },
  
  // Farmer specific
  crops: [{ type: String }],
  cropsHi: [{ type: String }],
  bankLinked: { type: Boolean, default: false },
  aadhaarVerified: { type: Boolean, default: false },
  
  // Buyer specific
  company: { type: String },
  companyHi: { type: String },
  gstLinked: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalTrades: { type: Number, default: 0 },
  minQuantity: { type: Number },
  maxQuantity: { type: Number },
  preferredQuality: { type: String },
  paymentTerms: { type: String },
  paymentTermsHi: { type: String }
}, { timestamps: true });

// Strip sensitive info when serializing
userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
