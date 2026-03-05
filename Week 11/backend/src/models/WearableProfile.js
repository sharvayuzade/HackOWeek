import mongoose from "mongoose";

const wearableProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    provider: {
      type: String,
      required: true,
      trim: true
    },
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
    syncedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

wearableProfileSchema.index({ user: 1, syncedAt: -1 });

export const WearableProfile = mongoose.model("WearableProfile", wearableProfileSchema);
