const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./src/models/Doctor');

dotenv.config();

const doctors = [
  {
    name: 'Dr. Sarah Wilson',
    specialization: 'Cardiologist',
    cabinNumber: 'C-101',
    phone: '555-0101',
    availableDays: ['Mon', 'Wed', 'Fri'],
    status: 'Available'
  },
  {
    name: 'Dr. James Miller',
    specialization: 'Neurologist',
    cabinNumber: 'N-202',
    phone: '555-0102',
    availableDays: ['Tue', 'Thu', 'Sat'],
    status: 'Busy'
  },
  {
    name: 'Dr. Emily Chen',
    specialization: 'Pediatrician',
    cabinNumber: 'P-303',
    phone: '555-0103',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    status: 'Available'
  },
  {
    name: 'Dr. Robert Brown',
    specialization: 'Orthopedic',
    cabinNumber: 'O-404',
    phone: '555-0104',
    availableDays: ['Mon', 'Thu'],
    status: 'In Surgery'
  }
];

const seedDoctors = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing doctors
    await Doctor.deleteMany();
    
    // Add new doctors
    await Doctor.insertMany(doctors);
    
    console.log('✅ Doctors Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDoctors();
