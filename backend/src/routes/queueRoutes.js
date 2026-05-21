const express = require('express');
const router = express.Router();
const Queue = require('../models/Queue');

// @desc    Add patient to the queue
// @route   POST /api/queue
// @access  Public
router.post('/', async (req, res) => {
  const { patientName, doctorName, reason } = req.body;
  try {
    const queueEntry = await Queue.create({ patientName, doctorName, reason });
    // Emit real-time update to all connected clients
    const io = req.app.get('io');
    if (io) io.emit('queueUpdated', queueEntry);
    res.status(201).json(queueEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get whole patient queue (active)
// @route   GET /api/queue
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Return ALL records; frontend handles tab filtering
    const queue = await Queue.find({}).sort({ arrivalTime: 1 });
    res.json(queue);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

// @desc    Update status of a patient in the queue
// @route   PUT /api/queue/:id
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const entry = await Queue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    const io = req.app.get('io');
    if (io) io.emit('queueUpdated', entry);
    res.json(entry);
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
});

module.exports = router;
