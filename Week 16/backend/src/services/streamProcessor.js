import AlertEvent from "../models/AlertEvent.js";
import StreamReading from "../models/StreamReading.js";
import { detectAnomalies } from "./anomalyService.js";
import { encryptPayload } from "../utils/crypto.js";

let ioInstance = null;

export const setSocketServer = (io) => {
  ioInstance = io;
};

const normalizeReading = (rawReading) => ({
  deviceId: String(rawReading.deviceId || "").trim(),
  bpm: Number(rawReading.bpm),
  spo2: rawReading.spo2 === null || rawReading.spo2 === undefined ? null : Number(rawReading.spo2),
  temperature:
    rawReading.temperature === null || rawReading.temperature === undefined
      ? null
      : Number(rawReading.temperature),
  capturedAt: rawReading.capturedAt ? new Date(rawReading.capturedAt) : new Date()
});

const validateReading = (reading) => {
  if (!reading.deviceId) {
    throw new Error("deviceId is required");
  }
  if (!Number.isFinite(reading.bpm)) {
    throw new Error("bpm must be a number");
  }
  if (!Number.isFinite(reading.capturedAt.getTime())) {
    throw new Error("capturedAt must be a valid date");
  }
};

export const processIncomingReading = async (rawReading) => {
  const reading = normalizeReading(rawReading);
  validateReading(reading);

  const savedReading = await StreamReading.create(reading);
  const anomalies = detectAnomalies(savedReading);

  const storedAlerts = [];
  for (const anomaly of anomalies) {
    const notificationBody = {
      deviceId: savedReading.deviceId,
      alertType: anomaly.alertType,
      severity: anomaly.severity,
      bpm: savedReading.bpm,
      capturedAt: savedReading.capturedAt.toISOString(),
      message: anomaly.message
    };

    const encryptedNotification = encryptPayload(notificationBody);
    const savedAlert = await AlertEvent.create({
      deviceId: savedReading.deviceId,
      alertType: anomaly.alertType,
      severity: anomaly.severity,
      bpm: savedReading.bpm,
      capturedAt: savedReading.capturedAt,
      message: anomaly.message,
      encryptedNotification
    });

    storedAlerts.push(savedAlert);

    if (ioInstance) {
      ioInstance.emit("alert:encrypted", {
        id: String(savedAlert._id),
        ...encryptedNotification,
        createdAt: savedAlert.createdAt.toISOString()
      });
    }
  }

  if (ioInstance) {
    ioInstance.emit("stream:reading", {
      id: String(savedReading._id),
      deviceId: savedReading.deviceId,
      bpm: savedReading.bpm,
      spo2: savedReading.spo2,
      temperature: savedReading.temperature,
      capturedAt: savedReading.capturedAt.toISOString()
    });
  }

  return {
    reading: savedReading,
    alerts: storedAlerts
  };
};