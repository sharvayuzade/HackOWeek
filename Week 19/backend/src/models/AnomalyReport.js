import mongoose from "mongoose";

const anomalyReportSchema = new mongoose.Schema(
  {
    encryptedRecordId: { type: String, required: true, trim: true },
    sourceSystem: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true
    },
    summary: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "investigating", "resolved"],
      default: "open"
    },
    reportedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export const AnomalyReport = mongoose.model("AnomalyReport", anomalyReportSchema);
