const mongoose = require('mongoose');

const DepotStockSchema = new mongoose.Schema({
  depot: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', required: true },
  size: { type: String, required: true },
  received: { type: Number, default: 0 },
  sold: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('DepotStock', DepotStockSchema);
