const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./src/models/Doctor');

dotenv.config();

const doctors = [
    // Cardiology
    { id: 'DR101', name: 'Dr. Rajesh Sharma', specialty: 'Cardiology', experience: '15 years', status: 'Available', rating: 4.9, appointments: 8 },
    { id: 'DR102', name: 'Dr. Priya Patel', specialty: 'Cardiology', experience: '12 years', status: 'In Consultation', rating: 4.8, appointments: 5 },
    { id: 'DR103', name: 'Dr. Amit Verma', specialty: 'Cardiology', experience: '10 years', status: 'Available', rating: 4.7, appointments: 3 },
    { id: 'DR104', name: 'Dr. Sneha Gupta', specialty: 'Cardiology', experience: '8 years', status: 'On Leave', rating: 4.6, appointments: 0 },
    { id: 'DR105', name: 'Dr. Vikram Singh', specialty: 'Cardiology', experience: '20 years', status: 'Available', rating: 5.0, appointments: 12 },
    { id: 'DR106', name: 'Dr. Anjali Desai', specialty: 'Cardiology', experience: '7 years', status: 'Available', rating: 4.5, appointments: 4 },
    { id: 'DR107', name: 'Dr. Sanjay Mehra', specialty: 'Cardiology', experience: '18 years', status: 'In Consultation', rating: 4.9, appointments: 9 },
    { id: 'DR108', name: 'Dr. Kavita Reddy', specialty: 'Cardiology', experience: '14 years', status: 'Available', rating: 4.8, appointments: 6 },
    { id: 'DR109', name: 'Dr. Manoj Tiwari', specialty: 'Cardiology', experience: '11 years', status: 'Available', rating: 4.7, appointments: 5 },
    { id: 'DR110', name: 'Dr. Shalini Iyer', specialty: 'Cardiology', experience: '9 years', status: 'Available', rating: 4.6, appointments: 4 },

    // Pediatrics
    { id: 'DR201', name: 'Dr. Deepak Kapur', specialty: 'Pediatrics', experience: '12 years', status: 'Available', rating: 4.9, appointments: 10 },
    { id: 'DR202', name: 'Dr. Neha Malhotra', specialty: 'Pediatrics', experience: '9 years', status: 'Available', rating: 4.8, appointments: 7 },
    { id: 'DR203', name: 'Dr. Rahul Bose', specialty: 'Pediatrics', experience: '15 years', status: 'In Consultation', rating: 4.9, appointments: 8 },
    { id: 'DR204', name: 'Dr. Pooja Hegde', specialty: 'Pediatrics', experience: '6 years', status: 'Available', rating: 4.5, appointments: 2 },
    { id: 'DR205', name: 'Dr. Suresh Raina', specialty: 'Pediatrics', experience: '11 years', status: 'On Leave', rating: 4.7, appointments: 0 },
    { id: 'DR206', name: 'Dr. Ritu Kumar', specialty: 'Pediatrics', experience: '13 years', status: 'Available', rating: 4.8, appointments: 6 },
    { id: 'DR207', name: 'Dr. Alok Nath', specialty: 'Pediatrics', experience: '22 years', status: 'Available', rating: 5.0, appointments: 15 },
    { id: 'DR208', name: 'Dr. Meera Bai', specialty: 'Pediatrics', experience: '8 years', status: 'Available', rating: 4.6, appointments: 4 },
    { id: 'DR209', name: 'Dr. Arvind Swami', specialty: 'Pediatrics', experience: '10 years', status: 'In Consultation', rating: 4.7, appointments: 5 },
    { id: 'DR210', name: 'Dr. Sunita Williams', specialty: 'Pediatrics', experience: '14 years', status: 'Available', rating: 4.8, appointments: 7 },

    // Orthopedics
    { id: 'DR301', name: 'Dr. Sandeep Singh', specialty: 'Orthopedics', experience: '16 years', status: 'Available', rating: 4.9, appointments: 9 },
    { id: 'DR302', name: 'Dr. Gaurav Chopra', specialty: 'Orthopedics', experience: '12 years', status: 'Available', rating: 4.8, appointments: 6 },
    { id: 'DR303', name: 'Dr. Ishita Dutta', specialty: 'Orthopedics', experience: '9 years', status: 'Available', rating: 4.7, appointments: 4 },
    { id: 'DR304', name: 'Dr. Sameer Khan', specialty: 'Orthopedics', experience: '20 years', status: 'In Consultation', rating: 5.0, appointments: 11 },
    { id: 'DR305', name: 'Dr. Divya Bharti', specialty: 'Orthopedics', experience: '7 years', status: 'Available', rating: 4.6, appointments: 3 },
    { id: 'DR306', name: 'Dr. Akshay Kumar', specialty: 'Orthopedics', experience: '14 years', status: 'Available', rating: 4.8, appointments: 5 },
    { id: 'DR307', name: 'Dr. Madhuri Dixit', specialty: 'Orthopedics', experience: '11 years', status: 'On Leave', rating: 4.7, appointments: 0 },
    { id: 'DR308', name: 'Dr. Pankaj Tripathi', specialty: 'Orthopedics', experience: '18 years', status: 'Available', rating: 4.9, appointments: 8 },
    { id: 'DR309', name: 'Dr. Juhi Chawla', specialty: 'Orthopedics', experience: '13 years', status: 'Available', rating: 4.8, appointments: 6 },
    { id: 'DR310', name: 'Dr. Varun Dhawan', specialty: 'Orthopedics', experience: '8 years', status: 'Available', rating: 4.6, appointments: 4 },

    // Neurology
    { id: 'DR401', name: 'Dr. Amitabh Bachchan', specialty: 'Neurology', experience: '30 years', status: 'Available', rating: 5.0, appointments: 5 },
    { id: 'DR402', name: 'Dr. Rekha Ganesan', specialty: 'Neurology', experience: '25 years', status: 'Available', rating: 4.9, appointments: 4 },
    { id: 'DR403', name: 'Dr. Shah Rukh Khan', specialty: 'Neurology', experience: '15 years', status: 'In Consultation', rating: 4.8, appointments: 6 },
    { id: 'DR404', name: 'Dr. Kajol Devgn', specialty: 'Neurology', experience: '12 years', status: 'Available', rating: 4.7, appointments: 3 },
    { id: 'DR405', name: 'Dr. Aamir Khan', specialty: 'Neurology', experience: '20 years', status: 'Available', rating: 4.9, appointments: 7 },
    { id: 'DR406', name: 'Dr. Rani Mukerji', specialty: 'Neurology', experience: '10 years', status: 'On Leave', rating: 4.6, appointments: 0 },
    { id: 'DR407', name: 'Dr. Hrithik Roshan', specialty: 'Neurology', experience: '14 years', status: 'Available', rating: 4.8, appointments: 5 },
    { id: 'DR408', name: 'Dr. Karisma Kapoor', specialty: 'Neurology', experience: '18 years', status: 'In Consultation', rating: 4.7, appointments: 4 },
    { id: 'DR409', name: 'Dr. Saif Ali Khan', specialty: 'Neurology', experience: '11 years', status: 'Available', rating: 4.6, appointments: 3 },
    { id: 'DR410', name: 'Dr. Vidya Balan', specialty: 'Neurology', experience: '9 years', status: 'Available', rating: 4.5, appointments: 2 },

    // Dermatology
    { id: 'DR501', name: 'Dr. Deepika Padukone', specialty: 'Dermatology', experience: '10 years', status: 'Available', rating: 4.9, appointments: 12 },
    { id: 'DR502', name: 'Dr. Ranveer Singh', specialty: 'Dermatology', experience: '8 years', status: 'Available', rating: 4.7, appointments: 9 },
    { id: 'DR503', name: 'Dr. Alia Bhatt', specialty: 'Dermatology', experience: '5 years', status: 'Available', rating: 4.6, appointments: 15 },
    { id: 'DR504', name: 'Dr. Ranbir Kapoor', specialty: 'Dermatology', experience: '9 years', status: 'In Consultation', rating: 4.8, appointments: 6 },
    { id: 'DR505', name: 'Dr. Katrina Kaif', specialty: 'Dermatology', experience: '12 years', status: 'Available', rating: 4.7, appointments: 8 },
    { id: 'DR506', name: 'Dr. Vicky Kaushal', specialty: 'Dermatology', experience: '6 years', status: 'Available', rating: 4.5, appointments: 5 },
    { id: 'DR507', name: 'Dr. Shraddha Kapoor', specialty: 'Dermatology', experience: '7 years', status: 'On Leave', rating: 4.6, appointments: 0 },
    { id: 'DR508', name: 'Dr. Rajkummar Rao', specialty: 'Dermatology', experience: '9 years', status: 'Available', rating: 4.7, appointments: 7 },
    { id: 'DR509', name: 'Dr. Taapsee Pannu', specialty: 'Dermatology', experience: '8 years', status: 'Available', rating: 4.6, appointments: 6 },
    { id: 'DR510', name: 'Dr. Ayushmann Khurrana', specialty: 'Dermatology', experience: '10 years', status: 'Available', rating: 4.8, appointments: 10 }
];

const seedAllDoctors = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');
        
        await Doctor.deleteMany();
        console.log('Cleared existing doctors.');
        
        await Doctor.insertMany(doctors.map(d => ({
            ...d,
            status: d.status === 'In Consultation' ? 'In Consultation' : d.status // Normalize status if needed
        })));
        
        console.log(`✅ ${doctors.length} Doctors Seeded Successfully!`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAllDoctors();
