import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smilecare_db';
    await mongoose.connect(mongoURI);
    console.log(`✅ SmileCare Database Connected Successfully to MongoDB Compass (${mongoURI})`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('💡 Make sure MongoDB Compass or local MongoDB service is running on mongodb://127.0.0.1:27017/smilecare_db');
  }
};

export default connectDB;