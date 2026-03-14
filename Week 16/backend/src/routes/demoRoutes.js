import { Router } from "express";
import {
  seedDemoData,
  startSimulator,
  stopSimulator,
  getSimulatorStatus
} from "../services/demoService.js";

const demoRoutes = Router();

demoRoutes.post("/seed", async (req, res) => {
  try {
    const force = Boolean(req.body?.force);
    const result = await seedDemoData({ force });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

demoRoutes.get("/simulate/status", (_req, res) => {
  res.json(getSimulatorStatus());
});

demoRoutes.post("/simulate/start", (_req, res) => {
  const started = startSimulator();
  res.json({ running: true, started });
});

demoRoutes.post("/simulate/stop", (_req, res) => {
  const stopped = stopSimulator();
  res.json({ running: false, stopped });
});

export default demoRoutes;