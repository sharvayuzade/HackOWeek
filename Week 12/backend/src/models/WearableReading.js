import mongoose from "mongoose";

const wearableReadingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true
    },
    encryptedPayload: {
      type: String,
      required: true
    },
    iv: {
      type: String,
      required: true
    },
    authTag: {
      type: String,
      required: true
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    versionKey: false
  }
);

const WearableReading = mongoose.model("WearableReading", wearableReadingSchema);

export default WearableReading;