require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const Inventory = require('./models/inventory');
const Vendor = require('./models/vendor');
const PurchaseOrder = require('./models/purchaseOrder');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/procureai');
    console.log('Database connected for seeding...');

    await User.deleteMany({});
    await Inventory.deleteMany({});
    await Vendor.deleteMany({});
    await PurchaseOrder.deleteMany({});

    const passwordHash = await bcrypt.hash('password123', 10);

    const owner = await User.create({
      name: 'John Doe',
      email: 'owner@company.com',
      password: passwordHash,
      role: 'Owner',
      companyName: 'Acme Corp',
    });

    const manager = await User.create({
      name: 'Jane Smith',
      email: 'manager@company.com',
      password: passwordHash,
      role: 'Manager',
      companyName: 'Acme Corp',
    });

    const validator = await User.create({
      name: 'Bob Johnson',
      email: 'validator@company.com',
      password: passwordHash,
      role: 'Validator',
      companyName: 'Acme Corp',
    });

    console.log('Users seeded successfully');

    await Inventory.insertMany([
      { itemName: 'Laptop', currentStock: 50, thresholdLimit: 20 },
      { itemName: 'USB Cable', currentStock: 100, thresholdLimit: 30 },
      { itemName: 'Monitor', currentStock: 25, thresholdLimit: 10 },
    ]);

    console.log('Inventory seeded successfully');

    await Vendor.create({
      name: 'Dell Inc',
      email: 'sales@dell.com',
      phone: '1-800-DELL',
      address: 'Round Rock, Texas',
      averagePrice: 800,
      companyId: owner._id,
    });

    console.log('Vendor seeded successfully');
    console.log('Seeding finished successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();
