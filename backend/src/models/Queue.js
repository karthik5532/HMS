const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
  },
  doctorName: {
     type: String,
     required: true
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Waiting', 'In Consultation', 'Completed', 'Cancelled'],
    default: 'Waiting',
  },
  arrivalTime: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const Queue = mongoose.model('Queue', queueSchema);
module.exports = Queue;
