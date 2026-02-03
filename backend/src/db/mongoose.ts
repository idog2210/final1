import mongoose from 'mongoose';
const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  throw new Error('MONGO_URL is not defined in environment variables');
}

mongoose.connect(mongoUrl);
