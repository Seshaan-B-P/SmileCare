import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is resolved regardless of whether execution is in server or root folder
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smilecare_db';
    await mongoose.connect(mongoURI, {
      dbName: 'smilecare',
      serverSelectionTimeoutMS: 8000
    });
    const isAtlas = mongoURI.includes('mongodb.net');
    const dbName = mongoose.connection.name;
    const maskedURI = mongoURI.replace(/:([^:@]+)@/, ':****@');
    console.log(`✅ SmileCare Database Connected to ${isAtlas ? `MongoDB Atlas Cloud (DB: "${dbName}")` : 'Local MongoDB'} [${maskedURI}]`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('💡 Ensure MongoDB Atlas cluster is online and Network Access (IP Whitelist) allows connections.');
  }
};

export default connectDB;