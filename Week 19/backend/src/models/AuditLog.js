import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    action: { type: String, required: true, trim: true },
    resource: { type: String, required: true, trim: true },
    encryptedRecordId: { type: String, required: true, trim: true },
    purpose: { type: String, trim: true },
    status: {
      type: String,
      enum: ["success", "denied", "error"],
      default: "success"
    },
    ipAddress: { type: String, trim: true },
    accessedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
