import EncryptedAnalysisRecord from "../models/EncryptedAnalysisRecord.js";
import { ingestAnalysisData } from "./dataService.js";

const demoData = [
  { deviceId: "watch-301", bpm: 82, steps: 4100, stressIndex: 0.28, anomalyScore: 0.22 },
  { deviceId: "watch-302", bpm: 95, steps: 5200, stressIndex: 0.44, anomalyScore: 0.38 },
  { deviceId: "watch-303", bpm: 128, steps: 6900, stressIndex: 0.78, anomalyScore: 0.84 },
  { deviceId: "watch-304", bpm: 88, steps: 4800, stressIndex: 0.33, anomalyScore: 0.31 },
  { deviceId: "watch-305", bpm: 133, steps: 7100, stressIndex: 0.81, anomalyScore: 0.91 },
  { deviceId: "watch-306", bpm: 90, steps: 5000, stressIndex: 0.46, anomalyScore: 0.42 },
  { deviceId: "watch-307", bpm: 121, steps: 6600, stressIndex: 0.69, anomalyScore: 0.74 },
  { deviceId: "watch-308", bpm: 136, steps: 7200, stressIndex: 0.83, anomalyScore: 0.96 }
];

export const seedDemoData = async ({ force = false } = {}) => {
  const count = await EncryptedAnalysisRecord.countDocuments();
  if (count > 0 && !force) {
    return { inserted: 0, skipped: true };
  }

  if (force) {
    await EncryptedAnalysisRecord.deleteMany({});
  }

  let inserted = 0;
  for (const row of demoData) {
    await ingestAnalysisData({
      ...row,
      capturedAt: new Date().toISOString()
    });
    inserted += 1;
  }

  return { inserted, skipped: false };
};