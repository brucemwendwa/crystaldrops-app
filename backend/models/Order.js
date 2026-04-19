const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    name: String,
    quantity: Number,
    price: Number
  }],
  total: {
    type: Number,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  deliveryName: { type: String, default: '' },
  deliveryLocation: { type: String, default: '' },
  paymentMethod: { type: String, default: 'mpesa' },
  status: {
    type: String,
    enum: ['pending', 'processing', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
