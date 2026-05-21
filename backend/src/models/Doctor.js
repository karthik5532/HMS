const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  specialty: {
    type: String,
    required: [true, 'Please add specialty']
  },
  experience: {
    type: String,
    required: [true, 'Please add experience']
  },
  status: {
    type: String,
    enum: ['Available', 'In Consultation', 'On Leave', 'Busy', 'Emergency'],
    default: 'Available'
  },
  rating: {
    type: Number,
    default: 0
  },
  appointments: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: 'default-doctor.png'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
