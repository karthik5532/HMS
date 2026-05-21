const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Inventory = require('./src/models/Inventory');

dotenv.config();

const inventoryItems = [
    { id: 'EQ-401', name: 'Standard Wheelchair', category: 'Mobility', stock: 24, status: 'Active' },
    { id: 'EQ-882', name: 'Multipara Patient Monitor', category: 'Bio-Medical', stock: 12, status: 'In Use' },
    { id: 'EQ-105', name: 'Mobile ICU Ventilator', category: 'Life Support', stock: 5, status: 'Maintenance' },
    { id: 'SUP-901', name: 'IV Infusion Sets (Box)', category: 'Disposable', stock: 120, status: 'In Stock' },
    { id: 'SUP-223', name: 'Surgical Gown (Sterile)', category: 'Apparel', stock: 450, status: 'High Demand' },
    { id: 'EQ-331', name: 'Defibrillator (AED)', category: 'Emergency', stock: 8, status: 'Critical' },
    { id: 'SUP-552', name: 'Dialysis Filter', category: 'Renal Care', stock: 35, status: 'Low Stock' },
    { id: 'EQ-092', name: 'Pulse Oximeter', category: 'Diagnostics', stock: 55, status: 'In Stock' }
];

const seedInventory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Inventory.deleteMany();
    await Inventory.insertMany(inventoryItems);
    console.log('✅ Inventory Seeded Successfully!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedInventory();
