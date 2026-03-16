import { useEffect, useMemo, useState } from "react";
import { downloadSecureExport, fetchRecentRecords, seedDemoData } from "./api";
import type { AnalysisRecord } from "./types";

const formatDateTime = (value: string): string => {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toLocaleString() : "-";
};

function App() {
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [token, setToken] = useState("week17-secure-token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const anomalyCount = useMemo(
    () => records.filter((record) => record.isAnomaly).length,
    [records]
  );

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchRecentRecords();
      setRecords(payload.records);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  const handleSeed = async () => {
    try {
      setError(null);
      await seedDemoData();
      await loadRecords();
    } catch (seedError) {
      setError(seedError instanceof Error ? seedError.message : "Failed to seed data");
    }
  };

  const handleExport = async (type: "csv" | "pdf") => {
    if (!token.trim()) {
      setError("Export token is required");
      return;
    }

    try {
      setError(null);
      await downloadSecureExport(type, token.trim());
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Export request failed");
    }
  };

  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="brand-group">
          <span className="brand-chip">Week 17</span>
          <div>
            <h1>User Data Export Platform</h1>
            <p>React + TypeScript interface for secure decrypted exports</p>
          </div>
        </div>
        <div className="nav-links">
          <a href="#overview">Overview</a>
          <a href="#exports">Exports</a>
          <a href="#records">Records</a>
        </div>
      </nav>

      <main className="content-shell">
        <section id="overview" className="stats-grid">
          <article className="stat-card">
            <p className="stat-label">Total Records</p>
            <p className="stat-value">{records.length}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Anomalies</p>
            <p className="stat-value stat-danger">{anomalyCount}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Normal Entries</p>
            <p className="stat-value">{records.length - anomalyCount}</p>
          </article>
        </section>

        <section id="exports" className="panel">
          <div className="panel-head">
            <h2>Export Controls</h2>
            <p>Token-authenticated CSV and PDF generation</p>
          </div>
          <div className="actions-row">
            <label className="token-input-wrap">
              <span>Export Token</span>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Enter secure export token"
              />
            </label>
            <button type="button" className="btn btn-muted" onClick={handleSeed}>
              Seed Demo Data
            </button>
            <button type="button" className="btn btn-muted" onClick={() => void loadRecords()}>
              Refresh
            </button>
            <button type="button" className="btn" onClick={() => void handleExport("csv")}>
              Export CSV
            </button>
            <button type="button" className="btn" onClick={() => void handleExport("pdf")}>
              Export PDF
            </button>
          </div>
          {error ? <p className="status-message status-error">{error}</p> : null}
        </section>

        <section id="records" className="panel">
          <div className="panel-head">
            <h2>Analyzed Records</h2>
            <p>{loading ? "Loading..." : `${records.length} loaded`}</p>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Device</th>
                  <th>BPM</th>
                  <th>Steps</th>
                  <th>Stress</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {!loading && records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-muted">
                      No records available
                    </td>
                  </tr>
                ) : null}
                {records.map((record) => (
                  <tr key={record.id} className={record.isAnomaly ? "row-anomaly" : ""}>
                    <td>{formatDateTime(record.capturedAt)}</td>
                    <td>{record.deviceId}</td>
                    <td>{record.bpm}</td>
                    <td>{record.steps}</td>
                    <td>{record.stressIndex}</td>
                    <td>{record.anomalyScore}</td>
                    <td>
                      {record.isAnomaly
                        ? `Anomaly (${record.anomalyReasons.join(", ")})`
                        : "Normal"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;