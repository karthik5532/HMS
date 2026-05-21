const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Patient = require('./src/models/Patient');
const User = require('./src/models/User');
const Queue = require('./src/models/Queue');
const Doctor = require('./src/models/Doctor');

dotenv.config();

const viewData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- MONGODB DATA EXPORT ---');
        
        const users = await User.find({}, { password: 0 });
        console.log('\n👥 USERS (' + users.length + '):');
        console.table(users.map(u => ({ Name: u.name, Email: u.email, Role: u.role })));

        const drs = await Doctor.find({});
        console.log('\n🩺 DOCTORS (' + drs.length + '):');
        console.table(drs.map(d => ({ Name: d.name, Specialization: d.specialization, Cabin: d.cabinNumber, Status: d.status })));

        const pts = await Patient.find({});
        console.log('\n🏥 PATIENTS (' + pts.length + '):');
        console.table(pts.slice(0, 5).map(p => ({ ID: p.id, Name: p.name, Condition: p.condition })));

        const q = await Queue.find({});
        console.log('\n🕒 QUEUE (' + q.length + '):');
        console.table(q.map(item => ({ Patient: item.patientName, Status: item.status })));

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

viewData();
