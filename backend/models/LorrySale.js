const mongoose = require('mongoose');

const LorrySaleSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sales: [{
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ['Single', 'Parcel', 'Refill'], required: true },
    amount: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('LorrySale', LorrySaleSchema);
