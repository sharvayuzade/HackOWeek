import mongoose from "mongoose";

const encryptedWearableRecordSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    ciphertext: {
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
    versionKey: false,
    collection: "encrypted_wearable_records"
  }
);

const EncryptedWearableRecord = mongoose.model(
  "EncryptedWearableRecord",
  encryptedWearableRecordSchema
);

export default EncryptedWearableRecord;
