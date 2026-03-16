export type AnalysisRecord = {
  id: string;
  deviceId: string;
  capturedAt: string;
  bpm: number;
  steps: number;
  stressIndex: number;
  anomalyScore: number;
  isAnomaly: boolean;
  anomalyReasons: string[];
};

export type RecentRecordsResponse = {
  count: number;
  records: AnalysisRecord[];
};