import { Router } from "express";
import { AuditLog } from "../models/AuditLog.js";
import { AnomalyReport } from "../models/AnomalyReport.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/audit-logs", requireRole("admin"), async (req, res, next) => {
  try {
    const { status, role, q } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (role) {
      filter.role = role;
    }

    if (q) {
      filter.$or = [
        { actorId: { $regex: q, $options: "i" } },
        { resource: { $regex: q, $options: "i" } },
        { encryptedRecordId: { $regex: q, $options: "i" } },
        { action: { $regex: q, $options: "i" } }
      ];
    }

    const logs = await AuditLog.find(filter).sort({ accessedAt: -1 }).limit(150).lean();
    res.json({ data: logs });
  } catch (error) {
    next(error);
  }
});

router.get("/anomaly-reports", requireRole("admin"), async (req, res, next) => {
  try {
    const { severity, status, q } = req.query;
    const filter = {};

    if (severity) {
      filter.severity = severity;
    }

    if (status) {
      filter.status = status;
    }

    if (q) {
      filter.$or = [
        { sourceSystem: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { encryptedRecordId: { $regex: q, $options: "i" } }
      ];
    }

    const reports = await AnomalyReport.find(filter).sort({ reportedAt: -1 }).limit(150).lean();
    res.json({ data: reports });
  } catch (error) {
    next(error);
  }
});

router.get("/dashboard-summary", requireRole("admin"), async (_req, res, next) => {
  try {
    const [
      totalAuditLogs,
      deniedAccessCount,
      totalAnomalyReports,
      openAnomalyCount,
      criticalAnomalyCount
    ] = await Promise.all([
      AuditLog.countDocuments(),
      AuditLog.countDocuments({ status: "denied" }),
      AnomalyReport.countDocuments(),
      AnomalyReport.countDocuments({ status: { $in: ["open", "investigating"] } }),
      AnomalyReport.countDocuments({ severity: "critical" })
    ]);

    res.json({
      data: {
        totalAuditLogs,
        deniedAccessCount,
        totalAnomalyReports,
        openAnomalyCount,
        criticalAnomalyCount
      }
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/anomaly-reports/:id/status", requireRole("admin"), async (req, res, next) => {
  try {
    const allowedStatuses = ["open", "investigating", "resolved"];
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: "invalid_status",
        message: "Status must be one of: open, investigating, resolved."
      });
    }

    const updated = await AnomalyReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({
        error: "not_found",
        message: "Anomaly report not found."
      });
    }

    return res.json({ data: updated, message: "Anomaly report updated." });
  } catch (error) {
    return next(error);
  }
});

router.post("/seed-demo", requireRole("admin"), async (_req, res, next) => {
  try {
    const logCount = await AuditLog.countDocuments();
    const reportCount = await AnomalyReport.countDocuments();

    if (logCount === 0) {
      await AuditLog.insertMany([
        {
          actorId: "admin-01",
          role: "admin",
          action: "decrypt_view",
          resource: "student_records",
          encryptedRecordId: "enc-student-2001",
          purpose: "Quarterly compliance review",
          status: "success",
          ipAddress: "127.0.0.1"
        },
        {
          actorId: "auditor-02",
          role: "auditor",
          action: "decrypt_view",
          resource: "library_usage",
          encryptedRecordId: "enc-library-818",
          purpose: "External audit",
          status: "denied",
          ipAddress: "127.0.0.1"
        }
      ]);
    }

    if (reportCount === 0) {
      await AnomalyReport.insertMany([
        {
          encryptedRecordId: "enc-hvac-042",
          sourceSystem: "HVAC Monitoring",
          severity: "high",
          summary: "Unexpected sustained night load in Block B",
          status: "investigating"
        },
        {
          encryptedRecordId: "enc-hostel-119",
          sourceSystem: "Hostel Laundry",
          severity: "medium",
          summary: "Weekend peak exceeded baseline by 32%",
          status: "open"
        }
      ]);
    }

    res.status(201).json({ message: "Demo data is ready." });
  } catch (error) {
    next(error);
  }
});

export default router;
