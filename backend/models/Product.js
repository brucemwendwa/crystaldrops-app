const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. cd-05l
  name: { type: String, required: true },
  size: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String },
  source: { type: String },
  purification: { type: String },
  benefits: { type: String },
  prices: {
    single: { type: Number, required: true },
    parcel: { type: Number, required: true },
    refill: { type: Number } // Optional, only some support refill
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
