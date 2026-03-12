import express from "express";
import EncryptedWearableRecord from "../models/EncryptedWearableRecord.js";
import { encryptJsonPayload } from "../utils/encryption.js";

const router = express.Router();

const isJsonObject = (value) => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

router.post("/ingest", async (req, res) => {
  try {
    if (!isJsonObject(req.body)) {
      return res.status(400).json({
        message: "Incoming payload must be a JSON object"
      });
    }

    const deviceId =
      typeof req.body.deviceId === "string" && req.body.deviceId.trim()
        ? req.body.deviceId.trim()
        : "unknown-device";

    const ciphertext = encryptJsonPayload(req.body);

    const saved = await EncryptedWearableRecord.create({
      deviceId,
      ciphertext
    });

    return res.status(201).json({
      message: "Payload encrypted and stored",
      recordId: saved._id,
      deviceId: saved.deviceId,
      receivedAt: saved.receivedAt
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to ingest payload"
    });
  }
});

router.get("/recent", async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);

    const records = await EncryptedWearableRecord.find({})
      .sort({ receivedAt: -1 })
      .limit(limit)
      .lean();

    return res.json({ count: records.length, records });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch records" });
  }
});

export default router;
