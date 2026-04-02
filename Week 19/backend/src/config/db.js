import mongoose from "mongoose";

export async function connectToDatabase({ mongoUri, dbName }) {
  const uri = `${mongoUri}${dbName}`;

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });

  return mongoose.connection;
}
