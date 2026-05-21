const express = require('express');
const router = express.Router();
const { 
  getDoctors, 
  getDoctor, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor 
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getDoctors)
  .post(protect, authorize('Admin', 'Receptionist'), createDoctor);

router.route('/:id')
  .get(getDoctor)
  .put(protect, authorize('Admin', 'Receptionist'), updateDoctor)
  .delete(protect, authorize('Admin'), deleteDoctor);

module.exports = router;
