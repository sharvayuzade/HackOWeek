export const getAnomalyThreshold = () => {
  const parsed = Number(process.env.ANOMALY_SCORE_THRESHOLD);
  return Number.isFinite(parsed) ? parsed : 0.75;
};

export const buildAnomalyDetails = (record) => {
  const reasons = [];
  const threshold = getAnomalyThreshold();

  if (Number(record.anomalyScore) >= threshold) {
    reasons.push(`anomalyScore >= ${threshold}`);
  }
  if (Number(record.bpm) >= 125) {
    reasons.push("high BPM");
  }
  if (Number(record.stressIndex) >= 0.7) {
    reasons.push("elevated stress index");
  }

  return {
    isAnomaly: reasons.length > 0,
    anomalyReasons: reasons
  };
};