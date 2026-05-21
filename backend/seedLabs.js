const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LabReport = require('./src/models/LabReport');

dotenv.config();

const reports = [
    { id: 'LR-501', patientName: 'Rajesh Khanna', testType: 'CBC (Complete Blood Count)', requestedBy: 'Dr. Vikram Singh', date: '2024-04-05', status: 'Completed', result: 'Normal' },
    { id: 'LR-502', patientName: 'Sushmita Sen', testType: 'Thyroid Profile (T3, T4, TSH)', requestedBy: 'Dr. Neha Malhotra', date: '2024-04-06', status: 'In Progress', result: 'Pending' },
    { id: 'LR-503', patientName: 'Shah Rukh Khan', testType: 'MRI Brain with Contrast', requestedBy: 'Dr. Amitabh Bachchan', date: '2024-04-07', status: 'Pending', result: 'Pending' },
    { id: 'LR-504', patientName: 'Kajol Devgn', testType: 'HbA1c (Diabetes)', requestedBy: 'Dr. Rajesh Sharma', date: '2024-04-07', status: 'Completed', result: 'Abnormal' },
    { id: 'LR-505', patientName: 'Ranbir Kapoor', testType: 'Liver Function Test (LFT)', requestedBy: 'Dr. Vidya Balan', date: '2024-04-08', status: 'In Progress', result: 'Pending' }
];

const seedLabs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await LabReport.deleteMany();
    await LabReport.insertMany(reports);
    console.log('✅ Lab Reports Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedLabs();
