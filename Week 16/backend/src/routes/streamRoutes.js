import { Router } from "express";
import StreamReading from "../models/StreamReading.js";
import { processIncomingReading } from "../services/streamProcessor.js";

const streamRoutes = Router();

streamRoutes.post("/ingest", async (req, res) => {
  try {
    const { reading, alerts } = await processIncomingReading(req.body || {});

    res.status(201).json({
      message: "Reading processed",
      reading: {
        id: String(reading._id),
        deviceId: reading.deviceId,
        bpm: reading.bpm,
        spo2: reading.spo2,
        temperature: reading.temperature,
        capturedAt: reading.capturedAt
      },
      alertCount: alerts.length
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

streamRoutes.get("/recent", async (req, res) => {
  const requestedLimit = Number(req.query.limit || 20);
  const limit = Math.min(Math.max(requestedLimit, 1), 100);

  const readings = await StreamReading.find({})
    .sort({ capturedAt: -1 })
    .limit(limit)
    .lean();

  res.json({
    count: readings.length,
    readings: readings.map((reading) => ({
      id: String(reading._id),
      deviceId: reading.deviceId,
      bpm: reading.bpm,
      spo2: reading.spo2,
      temperature: reading.temperature,
      capturedAt: reading.capturedAt
    }))
  });
});

export default streamRoutes;