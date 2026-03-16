import { Router } from "express";
import { seedDemoData } from "../services/demoService.js";

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

export default demoRoutes;