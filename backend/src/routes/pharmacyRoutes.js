const express = require('express');
const router = express.Router();
const { getMedicines, createMedicine, updateMedicine, deleteMedicine } = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getMedicines)
  .post(protect, authorize('Admin', 'Doctor', 'Receptionist'), createMedicine);

router.route('/:id')
  .put(protect, authorize('Admin', 'Doctor', 'Receptionist'), updateMedicine)
  .delete(protect, authorize('Admin', 'Doctor', 'Receptionist'), deleteMedicine);

module.exports = router;
