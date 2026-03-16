import EncryptedAnalysisRecord from "../models/EncryptedAnalysisRecord.js";
import { encryptPayload, decryptPayload } from "../utils/crypto.js";
import { buildAnomalyDetails } from "../utils/anomaly.js";

const normalizePayload = (payload) => ({
  deviceId: String(payload.deviceId || "").trim(),
  bpm: Number(payload.bpm),
  steps: Number(payload.steps),
  stressIndex: Number(payload.stressIndex),
  anomalyScore: Number(payload.anomalyScore),
  capturedAt: payload.capturedAt ? new Date(payload.capturedAt) : new Date()
});

const validatePayload = (payload) => {
  if (!payload.deviceId) {
    throw new Error("deviceId is required");
  }

  const numericFields = ["bpm", "steps", "stressIndex", "anomalyScore"];
  for (const field of numericFields) {
    if (!Number.isFinite(payload[field])) {
      throw new Error(`${field} must be a number`);
    }
  }

  if (!Number.isFinite(payload.capturedAt.getTime())) {
    throw new Error("capturedAt must be a valid date");
  }
};

export const ingestAnalysisData = async (inputPayload) => {
  const normalized = normalizePayload(inputPayload);
  validatePayload(normalized);

  const encryptedPayload = encryptPayload({
    bpm: normalized.bpm,
    steps: normalized.steps,
    stressIndex: normalized.stressIndex,
    anomalyScore: normalized.anomalyScore
  });

  const saved = await EncryptedAnalysisRecord.create({
    deviceId: normalized.deviceId,
    capturedAt: normalized.capturedAt,
    encryptedPayload
  });

  return saved;
};

export const mapDecryptedRecord = (record) => {
  const decrypted = decryptPayload(record.encryptedPayload);
  const merged = {
    id: String(record._id),
    deviceId: record.deviceId,
    capturedAt: record.capturedAt,
    bpm: decrypted.bpm,
    steps: decrypted.steps,
    stressIndex: decrypted.stressIndex,
    anomalyScore: decrypted.anomalyScore
  };

  return {
    ...merged,
    ...buildAnomalyDetails(merged)
  };
};

export const getRecentDecryptedData = async (limit = 25) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 200);
  const records = await EncryptedAnalysisRecord.find({})
    .sort({ capturedAt: -1 })
    .limit(safeLimit)
    .lean();

  return records.map(mapDecryptedRecord);
};