const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true, default: Date.now },
  timeIn: { type: Date },
  timeOut: { type: Date },
  shift: { type: String, enum: ['Day', 'Night', 'Both'], default: 'Day' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
