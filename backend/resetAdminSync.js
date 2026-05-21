const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/city-care');
    
    let admin = await User.findOne({ email: 'admin@citycare.com' });
    
    if (admin) {
      console.log('Found admin, resetting password...');
      admin.password = 'admin123';
      await admin.save();
    } else {
      console.log('Admin not found, creating new...');
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@citycare.com',
        password: 'admin123',
        role: 'Admin'
      });
    }
    
    console.log('Sync Successful: admin@citycare.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Core Sync Error:', err);
    process.exit(1);
  }
};

resetAdmin();
