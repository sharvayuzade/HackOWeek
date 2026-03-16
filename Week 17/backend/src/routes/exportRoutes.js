import { Router } from "express";
import { requireExportToken } from "../middleware/requireExportToken.js";
import { getRecentDecryptedData } from "../services/dataService.js";
import { buildCsvFromRecords, streamPdfFromRecords } from "../services/exportService.js";

const exportRoutes = Router();

exportRoutes.use(requireExportToken);

exportRoutes.get("/csv", async (req, res) => {
  const records = await getRecentDecryptedData(500);
  const csvContent = buildCsvFromRecords(records);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=analyzed-data-export.csv");
  res.send(csvContent);
});

exportRoutes.get("/pdf", async (req, res) => {
  const records = await getRecentDecryptedData(500);
  streamPdfFromRecords(res, records);
});

export default exportRoutes;