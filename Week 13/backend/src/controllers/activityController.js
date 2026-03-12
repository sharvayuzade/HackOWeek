import WearableReading from "../models/WearableReading.js";
import { decryptObject } from "../utils/crypto.js";

const toIsoDay = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

const toNumberOrNull = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

export const getDailyTrends = async (req, res) => {
  try {
    const days = Math.max(1, Math.min(60, Number(req.query.days) || 14));
    const deviceId = req.query.deviceId ? String(req.query.deviceId).trim() : "";

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (days - 1));

    const query = {
      receivedAt: { $gte: startDate }
    };

    if (deviceId) {
      query.deviceId = deviceId;
    }

    const records = await WearableReading.find(query)
      .sort({ receivedAt: 1 })
      .limit(10000)
      .lean();

    const byDay = new Map();
    const recentReadings = [];
    let decryptedCount = 0;

    for (const record of records) {
      try {
        const decrypted = decryptObject(record);
        const readingTime = decrypted.timestamp || record.receivedAt;
        const day = toIsoDay(readingTime);

        if (!day) {
          continue;
        }

        const heartRate = toNumberOrNull(decrypted.heartRate);
        const steps = toNumberOrNull(decrypted.steps);

        if (!byDay.has(day)) {
          byDay.set(day, {
            date: day,
            totalSteps: 0,
            heartRateSum: 0,
            heartRateCount: 0,
            readings: 0
          });
        }

        const slot = byDay.get(day);
        slot.readings += 1;

        if (steps !== null && steps >= 0) {
          slot.totalSteps += steps;
        }

        if (heartRate !== null && heartRate > 0) {
          slot.heartRateSum += heartRate;
          slot.heartRateCount += 1;
        }

        recentReadings.push({
          id: String(record._id),
          deviceId: record.deviceId,
          timestamp: new Date(readingTime).toISOString(),
          heartRate,
          steps
        });

        decryptedCount += 1;
      } catch {
        // Skip records that cannot be decrypted with the current key.
      }
    }

    const dailyTrends = Array.from(byDay.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        date: item.date,
        totalSteps: Math.round(item.totalSteps),
        avgHeartRate:
          item.heartRateCount > 0
            ? Math.round((item.heartRateSum / item.heartRateCount) * 10) / 10
            : 0,
        readings: item.readings
      }));

    const recent = recentReadings.slice(-20).reverse();

    res.json({
      summary: {
        daysRequested: days,
        deviceFilter: deviceId || null,
        recordsFetched: records.length,
        recordsDecrypted: decryptedCount,
        firstDate: dailyTrends[0]?.date || null,
        lastDate: dailyTrends[dailyTrends.length - 1]?.date || null
      },
      dailyTrends,
      recentReadings: recent
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to load activity trends" });
  }
};
