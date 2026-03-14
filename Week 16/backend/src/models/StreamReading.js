import mongoose from "mongoose";

const streamReadingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    bpm: {
      type: Number,
      required: true,
      min: 20,
      max: 260
    },
    spo2: {
      type: Number,
      min: 50,
      max: 100,
      default: null
    },
    temperature: {
      type: Number,
      min: 30,
      max: 45,
      default: null
    },
    capturedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("StreamReading", streamReadingSchema);