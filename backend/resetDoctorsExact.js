const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./src/models/Doctor');

dotenv.config();

const doctors = [
  { name: 'Dr. Rajesh Sharma', specialty: 'Cardiology', status: 'Available' },
  { name: 'Dr. Priya Patel', specialty: 'Cardiology', status: 'In Consultation' },
  { name: 'Dr. Amit Verma', specialty: 'Pediatrics', status: 'Available' },
  { name: 'Dr. Neha Malhotra', specialty: 'Pediatrics', status: 'On Leave' },
  { name: 'Dr. Sandeep Singh', specialty: 'Neurology', status: 'Available' },
  { name: 'Dr. Ishita Dutta', specialty: 'Neurology', status: 'Emergency' },
  { name: 'Dr. Vikash Goel', specialty: 'Orthopedics', status: 'Available' },
  { name: 'Dr. Pooja Hegde', specialty: 'Orthopedics', status: 'Available' },
  { name: 'Dr. Sameer Khan', specialty: 'Dermatology', status: 'Available' },
  { name: 'Dr. Anjali Desai', specialty: 'Dermatology', status: 'In Consultation' },
  { name: 'Dr. Vikram Seth', specialty: 'Radiology', status: 'Available' },
  { name: 'Dr. Meera Bai', specialty: 'Radiology', status: 'Available' }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Doctor.deleteMany();
    await Doctor.insertMany(doctors.map((d, i) => ({
      name: d.name,
      specialty: d.specialty,
      status: d.status,
      id: `DR-00${i+1}`,
      appointments: 0,
      experience: '10+ Years',
      qualifications: 'MBBS, MD'
    })));
    console.log('✅ Doctors reset to exactly 2 per department!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
