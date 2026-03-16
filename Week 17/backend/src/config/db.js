import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/";
  const dbName = process.env.MONGO_DB_NAME || "week17_user_data_export";

  await mongoose.connect(mongoUri, { dbName });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${dbName}`);
};