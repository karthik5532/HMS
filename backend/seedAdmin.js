const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const createInitialUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/city-care');
    console.log('Connected to DB...');

    // CREATE ADMIN
    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
    } else {
      await User.create({
        name: 'System Administrator',
        username: 'admin',
        email: 'admin@citycare.com',
        password: 'admin123',
        role: 'Admin'
      });
      console.log('Admin created: username: admin, password: admin123');
    }

    // CREATE DOCTOR
    const doctorExists = await User.findOne({ username: 'doctor1' });
    if (doctorExists) {
      console.log('Doctor user already exists');
    } else {
      await User.create({
        name: 'Dr. Surya Kumar',
        username: 'doctor1',
        email: 'surya@citycare.com',
        password: 'doctor123',
        role: 'Doctor'
      });
      console.log('Doctor created: username: doctor1, password: doctor123');
    }
    
    console.log('Seeding complete! You can now login.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
};

createInitialUsers();
