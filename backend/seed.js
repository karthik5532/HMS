const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    const userCount = await User.countDocuments();
    console.log('Current User Count:', userCount);

    const admin = await User.findOne({ email: 'admin@citycare.com' });
    if (admin) {
        console.log('Admin found. Resetting password...');
        admin.password = 'admin123login';
        await admin.save();
        console.log('Admin password reset to: admin123login');
    } else {
        console.log('No admin found. Creating default admin...');
        await User.create({
            name: 'City Care Admin',
            email: 'admin@citycare.com',
            password: 'admin123login',
            role: 'Admin'
        });
        console.log('Admin created: admin123login');
    }

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedAdmin();
