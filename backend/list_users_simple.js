const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({}, { password: 0 });
        console.log('USER_LIST_START');
        console.log(JSON.stringify(users, null, 2));
        console.log('USER_LIST_END');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
listUsers();
