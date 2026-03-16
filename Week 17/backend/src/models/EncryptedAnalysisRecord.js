import mongoose from "mongoose";

const encryptedAnalysisRecordSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    capturedAt: {
      type: Date,
      required: true,
      index: true
    },
    encryptedPayload: {
      iv: { type: String, required: true },
      authTag: { type: String, required: true },
      ciphertext: { type: String, required: true }
    }
  },
  { timestamps: true }
);

export default mongoose.model("EncryptedAnalysisRecord", encryptedAnalysisRecordSchema);