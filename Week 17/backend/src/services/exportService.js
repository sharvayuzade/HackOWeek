import PDFDocument from "pdfkit";

const csvEscape = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export const buildCsvFromRecords = (records) => {
  const headers = [
    "capturedAt",
    "deviceId",
    "bpm",
    "steps",
    "stressIndex",
    "anomalyScore",
    "isAnomaly",
    "anomalyReasons"
  ];

  const rows = records.map((record) => [
    new Date(record.capturedAt).toISOString(),
    record.deviceId,
    record.bpm,
    record.steps,
    record.stressIndex,
    record.anomalyScore,
    record.isAnomaly ? "YES" : "NO",
    (record.anomalyReasons || []).join("; ")
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
};

export const streamPdfFromRecords = (res, records) => {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=analyzed-data-export.pdf");

  doc.pipe(res);

  doc.fontSize(16).text("Analyzed Data Export", { align: "left" });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .fillColor("#4b5563")
    .text(`Generated at: ${new Date().toISOString()}`)
    .text(`Total records: ${records.length}`)
    .moveDown(1);

  for (const record of records) {
    if (doc.y > 740) {
      doc.addPage();
    }

    const anomalyLine = record.isAnomaly
      ? `ANOMALY: ${record.anomalyReasons.join(", ")}`
      : "Normal";

    if (record.isAnomaly) {
      doc
        .rect(38, doc.y - 2, 520, 54)
        .fillOpacity(0.08)
        .fillAndStroke("#ef4444", "#ef4444")
        .fillOpacity(1);
    }

    doc
      .fillColor("#111827")
      .fontSize(10)
      .text(`Time: ${new Date(record.capturedAt).toISOString()}`)
      .text(`Device: ${record.deviceId}`)
      .text(
        `BPM: ${record.bpm} | Steps: ${record.steps} | Stress Index: ${record.stressIndex} | Anomaly Score: ${record.anomalyScore}`
      )
      .fillColor(record.isAnomaly ? "#b91c1c" : "#1f2937")
      .text(anomalyLine)
      .fillColor("#111827")
      .moveDown(0.8);
  }

  doc.end();
};