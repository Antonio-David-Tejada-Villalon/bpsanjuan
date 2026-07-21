const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido'],
    maxlength: 254,
  },
  source: { type: String, default: 'home' },
  subscribedAt: { type: Date, default: Date.now },
}, { timestamps: false });

module.exports = mongoose.model('Subscriber', subscriberSchema);
