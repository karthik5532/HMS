const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
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
  status: {
    type: String,
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);
