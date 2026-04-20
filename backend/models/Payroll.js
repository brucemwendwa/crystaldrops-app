const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  shiftsWorked: { type: Number, default: 0 },
  basePay: { type: Number, default: 0 }, // 350 per shift
  productionBonus: { type: Number, default: 0 },
  totalPay: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', PayrollSchema);
