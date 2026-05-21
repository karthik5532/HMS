const LabReport = require('../models/LabReport');

exports.getReports = async (req, res) => {
  try {
    const reports = await LabReport.find();
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    const report = await LabReport.create(req.body);
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const report = await LabReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, data: report });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await LabReport.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
