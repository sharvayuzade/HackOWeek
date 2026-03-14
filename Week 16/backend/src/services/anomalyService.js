const getBpmThreshold = () => {
  const parsed = Number(process.env.BPM_ALERT_THRESHOLD);
  return Number.isFinite(parsed) ? parsed : 120;
};

export const detectAnomalies = (reading) => {
  const threshold = getBpmThreshold();
  const anomalies = [];

  if (reading.bpm > threshold) {
    anomalies.push({
      alertType: "HIGH_BPM",
      severity: reading.bpm >= threshold + 20 ? "critical" : "warning",
      message: `High BPM detected (${reading.bpm}). Threshold: ${threshold}`
    });
  }

  return anomalies;
};