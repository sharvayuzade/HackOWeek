import StreamReading from "../models/StreamReading.js";
import AlertEvent from "../models/AlertEvent.js";
import { processIncomingReading } from "./streamProcessor.js";

const demoDevices = ["watch-201", "watch-202", "watch-203", "watch-204"];

const seededReadings = [
  { deviceId: "watch-201", bpm: 81, spo2: 98, temperature: 36.6 },
  { deviceId: "watch-202", bpm: 87, spo2: 97, temperature: 36.8 },
  { deviceId: "watch-203", bpm: 92, spo2: 98, temperature: 36.7 },
  { deviceId: "watch-204", bpm: 124, spo2: 96, temperature: 37.0 },
  { deviceId: "watch-201", bpm: 134, spo2: 95, temperature: 37.2 },
  { deviceId: "watch-202", bpm: 89, spo2: 98, temperature: 36.6 },
  { deviceId: "watch-203", bpm: 141, spo2: 95, temperature: 37.3 },
  { deviceId: "watch-204", bpm: 84, spo2: 99, temperature: 36.5 }
];

let simulatorTimer = null;

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateSimulatedReading = () => {
  const normalBpm = randomInt(72, 105);
  const shouldSpike = Math.random() < 0.25;
  const bpm = shouldSpike ? randomInt(123, 155) : normalBpm;

  return {
    deviceId: demoDevices[randomInt(0, demoDevices.length - 1)],
    bpm,
    spo2: randomInt(94, 99),
    temperature: Number((36.3 + Math.random() * 1.1).toFixed(1)),
    capturedAt: new Date().toISOString()
  };
};

export const seedDemoData = async ({ force = false } = {}) => {
  const existingCount = await StreamReading.countDocuments();
  if (existingCount > 0 && !force) {
    return { insertedReadings: 0, insertedAlerts: 0, skipped: true };
  }

  if (force) {
    await StreamReading.deleteMany({});
    await AlertEvent.deleteMany({});
  }

  let insertedReadings = 0;
  let insertedAlerts = 0;
  for (const sample of seededReadings) {
    const { alerts } = await processIncomingReading(sample);
    insertedReadings += 1;
    insertedAlerts += alerts.length;
  }

  return { insertedReadings, insertedAlerts, skipped: false };
};

export const startSimulator = () => {
  if (simulatorTimer) {
    return false;
  }

  simulatorTimer = setInterval(async () => {
    try {
      await processIncomingReading(generateSimulatedReading());
    } catch (error) {
      console.error("Simulator tick failed:", error.message);
    }
  }, 2000);

  return true;
};

export const stopSimulator = () => {
  if (!simulatorTimer) {
    return false;
  }

  clearInterval(simulatorTimer);
  simulatorTimer = null;
  return true;
};

export const getSimulatorStatus = () => ({
  running: Boolean(simulatorTimer)
});