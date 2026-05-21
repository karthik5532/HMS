const express = require('express');
const router = express.Router();
const { getReports, createReport, updateReport, deleteReport } = require('../controllers/labController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getReports)
  .post(protect, authorize('Admin', 'Doctor', 'Receptionist'), createReport);

router.route('/:id')
  .put(protect, authorize('Admin', 'Doctor', 'Receptionist'), updateReport)
  .delete(protect, authorize('Admin', 'Doctor', 'Receptionist'), deleteReport);

module.exports = router;
