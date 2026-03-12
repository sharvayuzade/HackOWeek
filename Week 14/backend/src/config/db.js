import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/week14_encryption_pipeline";
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
};
