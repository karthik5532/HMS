const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@citycare.com' });
    if (adminExists) {
        console.log('Admin user already exists');
        process.exit();
    }

    await User.create({
      name: 'City Care Admin',
      email: 'admin@citycare.com',
      password: 'adminpassword',
      role: 'Admin'
    });

    console.log('Admin user seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();
