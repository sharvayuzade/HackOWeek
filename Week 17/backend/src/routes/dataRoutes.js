import { Router } from "express";
import { getRecentDecryptedData, ingestAnalysisData } from "../services/dataService.js";

const dataRoutes = Router();

dataRoutes.post("/ingest", async (req, res) => {
  try {
    const saved = await ingestAnalysisData(req.body || {});
    res.status(201).json({
      message: "Analyzed data ingested",
      id: String(saved._id),
      deviceId: saved.deviceId,
      capturedAt: saved.capturedAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

dataRoutes.get("/recent", async (req, res) => {
  const records = await getRecentDecryptedData(req.query.limit || 25);
  res.json({ count: records.length, records });
});

export default dataRoutes;