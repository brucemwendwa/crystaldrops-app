const mongoose = require('mongoose');

const DispatchLogSchema = new mongoose.Schema({
  date: { type: Date, required: true, default: Date.now },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantities: {
    '0.5L': { type: Number, default: 0 },
    '1L': { type: Number, default: 0 },
    '1.5L': { type: Number, default: 0 },
    '5L': { type: Number, default: 0 },
    '10L': { type: Number, default: 0 },
    '20L': { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('DispatchLog', DispatchLogSchema);
