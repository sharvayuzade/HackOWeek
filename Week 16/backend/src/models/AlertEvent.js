import mongoose from "mongoose";

const alertEventSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    alertType: {
      type: String,
      required: true,
      enum: ["HIGH_BPM"]
    },
    severity: {
      type: String,
      required: true,
      enum: ["warning", "critical"]
    },
    bpm: {
      type: Number,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    encryptedNotification: {
      iv: { type: String, required: true },
      authTag: { type: String, required: true },
      ciphertext: { type: String, required: true }
    },
    capturedAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("AlertEvent", alertEventSchema);