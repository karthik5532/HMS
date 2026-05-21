const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  category: {
    type: String,
    required: [true, 'Please add category']
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock amount']
  },
  price: {
    type: Number,
    required: [true, 'Please add price']
  },
  expiry: {
    type: String,
    required: [true, 'Please add expiry date']
  },
  status: {
    type: String,
    default: 'In Stock'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);
