import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true
    },
    jti: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    revokedAt: {
      type: Date,
      default: null
    },
    rotatedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RefreshToken",
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
