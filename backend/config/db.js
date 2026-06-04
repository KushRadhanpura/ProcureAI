const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting MongoDB Connection...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB Connected Successfully!');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
