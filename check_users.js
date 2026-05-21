const mongoose = require('mongoose');
const User = require('./backend/src/models/User');

const getCount = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/city-care');
        const count = await User.countDocuments();
        const users = await User.find({}, { password: 0 });
        console.log('COUNT:', count);
        console.log('USERS:', JSON.stringify(users, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
getCount();
