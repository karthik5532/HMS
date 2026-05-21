const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  patientName: {
    type: String,
    required: [true, 'Please add patient name']
  },
  testType: {
    type: String,
    required: [true, 'Please add test type']
  },
  requestedBy: {
    type: String,
    required: [true, 'Please add requested by']
  },
  date: {
    type: String,
    required: [true, 'Please add date']
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'In Progress'],
    default: 'Pending'
  },
  result: {
    type: String,
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LabReport', labReportSchema);
