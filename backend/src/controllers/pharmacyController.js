const Medicine = require('../models/Medicine');

exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) return res.status(404).json({ success: false, error: 'Medicine not found' });
    res.status(200).json({ success: true, data: medicine });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, error: 'Medicine not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
