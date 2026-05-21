const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Patient = require('./src/models/Patient');

dotenv.config();

const patients = [
  {
    id: 'PT-1001',
    name: 'Johnathan Archer',
    age: 42,
    gender: 'Male',
    contact: '+1 (555) 123-4567',
    condition: 'Chronic hypertension and mild tachycardia',
    suggestedDoctor: 'Dr. Robert Sullivan',
    status: 'Stable'
  },
  {
    id: 'PT-1002',
    name: 'Sarah Connor',
    age: 29,
    gender: 'Female',
    contact: '+1 (555) 987-6543',
    condition: 'Post-traumatic stress and acute fracture follow-up',
    suggestedDoctor: 'Dr. Emily Chen',
    status: 'In-treatment'
  },
  {
    id: 'PT-1003',
    name: 'Michael Burnham',
    age: 34,
    gender: 'Female',
    contact: '+1 (555) 555-0199',
    condition: 'Routine neurological screening',
    suggestedDoctor: 'Dr. Emily Chen',
    status: 'Recovering'
  },
  {
    id: 'PT-1004',
    name: 'James Holden',
    age: 38,
    gender: 'Male',
    contact: '+1 (555) 234-5678',
    condition: 'Radiation exposure monitoring',
    suggestedDoctor: 'Dr. Marcus Holloway',
    status: 'Stable'
  }
];

const seedPatients = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for patient seeding...');

    await Patient.deleteMany({}); // Clear existing to prevent duplicates
    console.log('Existing patients cleared.');

    await Patient.insertMany(patients);
    console.log('Sample patients seeded successfully!');

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedPatients();
