const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Medicine = require('./src/models/Medicine');

dotenv.config();

const inventory = [
    { id: 'PH-101', name: 'Dolo 650mg (Paracetamol)', category: 'Analgesics', stock: 1200, price: 30, expiry: '2025-12-01', status: 'In Stock' },
    { id: 'PH-102', name: 'Azithromycin 500mg', category: 'Antibiotics', stock: 450, price: 95, expiry: '2024-08-15', status: 'In Stock' },
    { id: 'PH-103', name: 'Pantoprazole 40mg', category: 'Antacids', stock: 80, price: 120, expiry: '2025-01-20', status: 'Low Stock' },
    { id: 'PH-104', name: 'Cetirizine 10mg', category: 'Anti-allergic', stock: 0, price: 25, expiry: '2024-11-10', status: 'Out of Stock' },
    { id: 'PH-105', name: 'Vicks Action 500', category: 'Cold & Flu', stock: 600, price: 45, expiry: '2025-06-30', status: 'In Stock' },
    { id: 'PH-106', name: 'Amoxicillin 250mg', category: 'Antibiotics', stock: 200, price: 75, expiry: '2024-09-05', status: 'In Stock' },
    { id: 'PH-107', name: 'Omee Capsule', category: 'Antacids', stock: 50, price: 110, expiry: '2024-12-15', status: 'Low Stock' }
];

const seedPharmacy = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Medicine.deleteMany();
    await Medicine.insertMany(inventory);
    console.log('✅ Pharmacy Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedPharmacy();
