import { Router } from "express";
import AlertEvent from "../models/AlertEvent.js";

const alertsRoutes = Router();

alertsRoutes.get("/recent", async (req, res) => {
  const requestedLimit = Number(req.query.limit || 20);
  const limit = Math.min(Math.max(requestedLimit, 1), 100);

  const alerts = await AlertEvent.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({
    count: alerts.length,
    alerts: alerts.map((alert) => ({
      id: String(alert._id),
      deviceId: alert.deviceId,
      alertType: alert.alertType,
      severity: alert.severity,
      bpm: alert.bpm,
      message: alert.message,
      capturedAt: alert.capturedAt,
      createdAt: alert.createdAt,
      encryptedNotification: alert.encryptedNotification
    }))
  });
});

export default alertsRoutes;