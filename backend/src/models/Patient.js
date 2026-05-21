const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  contact: { type: String, required: true },
  condition: { type: String, required: true },
  suggestedDoctor: { type: String },
  status: { type: String, default: 'In-treatment' },
  lastVisit: { type: Date, default: Date.now }
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
