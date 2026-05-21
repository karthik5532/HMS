const Patient = require('../models/Patient');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({});
    console.log(`[API] Fetching patients... Found ${patients.length} records`);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private
const createPatient = async (req, res) => {
  try {
    const { id, name, age, gender, contact, condition, suggestedDoctor, status } = req.body;
    const patientExists = await Patient.findOne({ id });

    if (patientExists) {
      return res.status(400).json({ message: 'Patient already exists' });
    }

    const patient = await Patient.create({
      id, name, age, gender, contact, condition, suggestedDoctor, status
    });

    const io = req.app.get('io');
    if (io) io.emit('patientAdded', patient);

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a patient
// @route   PUT /api/patients/:id
// @access  Private
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });

    if (patient) {
      patient.name = req.body.name || patient.name;
      patient.age = req.body.age || patient.age;
      patient.gender = req.body.gender || patient.gender;
      patient.contact = req.body.contact || patient.contact;
      patient.condition = req.body.condition || patient.condition;
      patient.suggestedDoctor = req.body.suggestedDoctor || patient.suggestedDoctor;
      patient.status = req.body.status || patient.status;

      const updatedPatient = await patient.save();
      const io = req.app.get('io');
      if (io) io.emit('patientUpdated', updatedPatient);
      res.json(updatedPatient);
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a patient
// @route   DELETE /api/patients/:id
// @access  Private
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });

    if (patient) {
      await patient.deleteOne();
      const io = req.app.get('io');
      if (io) io.emit('patientDeleted', req.params.id);
      res.json({ message: 'Patient removed' });
    } else {
      res.status(404).json({ message: 'Patient not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient
};
