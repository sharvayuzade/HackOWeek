import { Router } from "express";
import { getDailyTrends } from "../controllers/activityController.js";

const router = Router();

router.get("/daily-trends", getDailyTrends);

export default router;
