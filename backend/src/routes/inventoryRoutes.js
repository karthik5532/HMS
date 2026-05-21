const express = require('express');
const router = express.Router();
const { getInventory, createItem, updateItem, deleteItem } = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getInventory)
  .post(protect, authorize('Admin', 'Doctor', 'Receptionist'), createItem);

router.route('/:id')
  .put(protect, authorize('Admin', 'Doctor', 'Receptionist'), updateItem)
  .delete(protect, authorize('Admin'), deleteItem);

module.exports = router;
