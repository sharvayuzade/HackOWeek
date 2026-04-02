import { useMemo, useState } from "react";

function toReadableDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

function SummaryCard({ label, value, tone = "neutral" }) {
  return (
    <article className={`summary-card ${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function StatusPill({ value }) {
  return <span className={`status-pill status-${value}`}>{value}</span>;
}

export default function App() {
  const [userId, setUserId] = useState("admin-01");
  const [role, setRole] = useState("admin");
  const [auditLogs, setAuditLogs] = useState([]);
  const [anomalyReports, setAnomalyReports] = useState([]);
  const [summary, setSummary] = useState({
    totalAuditLogs: 0,
    deniedAccessCount: 0,
    totalAnomalyReports: 0,
    openAnomalyCount: 0,
    criticalAnomalyCount: 0
  });
  const [auditSearch, setAuditSearch] = useState("");
  const [anomalySearch, setAnomalySearch] = useState("");
  const [auditStatus, setAuditStatus] = useState("");
  const [auditRole, setAuditRole] = useState("");
  const [anomalySeverity, setAnomalySeverity] = useState("");
  const [anomalyStatus, setAnomalyStatus] = useState("");
  const [message, setMessage] = useState("Ready");
  const [isLoading, setIsLoading] = useState(false);

  const headers = useMemo(
    () => ({
      "x-user-id": userId,
      "x-user-role": role,
      "Content-Type": "application/json"
    }),
    [userId, role]
  );

  const isAdmin = role === "admin";

  async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }

  async function seedDemo() {
    try {
      setIsLoading(true);
      const data = await requestJson("/api/admin/seed-demo", {
        method: "POST",
        headers
      });
      setMessage(data.message || "Demo seed completed.");
      await refreshAll();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSummary() {
    const data = await requestJson("/api/admin/dashboard-summary", { headers });
    setSummary(data.data || summary);
  }

  async function loadAuditLogs() {
    const params = new URLSearchParams();
    if (auditSearch) params.set("q", auditSearch);
    if (auditStatus) params.set("status", auditStatus);
    if (auditRole) params.set("role", auditRole);

    const query = params.toString() ? `?${params.toString()}` : "";
    const data = await requestJson(`/api/admin/audit-logs${query}`, { headers });
    setAuditLogs(data.data || []);
  }

  async function loadAnomalyReports() {
    const params = new URLSearchParams();
    if (anomalySearch) params.set("q", anomalySearch);
    if (anomalySeverity) params.set("severity", anomalySeverity);
    if (anomalyStatus) params.set("status", anomalyStatus);

    const query = params.toString() ? `?${params.toString()}` : "";
    const data = await requestJson(`/api/admin/anomaly-reports${query}`, { headers });
    setAnomalyReports(data.data || []);
  }

  async function refreshAll() {
    try {
      setIsLoading(true);
      await Promise.all([loadSummary(), loadAuditLogs(), loadAnomalyReports()]);
      setMessage("Dashboard refreshed.");
    } catch (error) {
      setMessage(error.message);
      setAuditLogs([]);
      setAnomalyReports([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateReportStatus(id, nextStatus) {
    try {
      setIsLoading(true);
      const data = await requestJson(`/api/admin/anomaly-reports/${id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: nextStatus })
      });

      setMessage(data.message || "Anomaly report updated.");
      await refreshAll();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <div className="bg-shape shape-a" />
      <div className="bg-shape shape-b" />

      <header className="hero">
        <h1>Admin Compliance Panel</h1>
        <p>Audit encrypted data access and resolve anomalies with role-based enforcement.</p>
      </header>

      <section className="controls">
        <label>
          User ID
          <input value={userId} onChange={(e) => setUserId(e.target.value)} />
        </label>

        <label>
          Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">admin</option>
            <option value="auditor">auditor</option>
            <option value="viewer">viewer</option>
          </select>
        </label>

        <div className="button-row">
          <button disabled={isLoading} onClick={seedDemo}>
            Seed Demo
          </button>
          <button disabled={isLoading} onClick={refreshAll}>
            {isLoading ? "Loading..." : "Refresh Dashboard"}
          </button>
        </div>
      </section>

      <p className="message">{message}</p>

      {!isAdmin ? (
        <section className="access-warning">
          <h2>Access denied for this role</h2>
          <p>Only admin can view compliance logs and anomaly reports.</p>
        </section>
      ) : (
        <>
          <section className="summary-grid">
            <SummaryCard label="Total Audit Logs" value={summary.totalAuditLogs} />
            <SummaryCard label="Denied Access" value={summary.deniedAccessCount} tone="alert" />
            <SummaryCard label="Anomaly Reports" value={summary.totalAnomalyReports} />
            <SummaryCard label="Open or Investigating" value={summary.openAnomalyCount} tone="warn" />
            <SummaryCard label="Critical Anomalies" value={summary.criticalAnomalyCount} tone="critical" />
          </section>

          <section className="panel-block">
            <div className="panel-header">
              <h2>Encrypted Data Access Audit Logs</h2>
            </div>
            <div className="filters">
              <input
                placeholder="Search actor, resource, record, action"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
              <select value={auditStatus} onChange={(e) => setAuditStatus(e.target.value)}>
                <option value="">All status</option>
                <option value="success">success</option>
                <option value="denied">denied</option>
                <option value="error">error</option>
              </select>
              <select value={auditRole} onChange={(e) => setAuditRole(e.target.value)}>
                <option value="">All roles</option>
                <option value="admin">admin</option>
                <option value="auditor">auditor</option>
                <option value="viewer">viewer</option>
              </select>
              <button disabled={isLoading} onClick={loadAuditLogs}>
                Apply Filters
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Actor</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Encrypted Record</th>
                    <th>Status</th>
                    <th>Accessed At</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-state">
                        No records available.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td>{log.actorId}</td>
                        <td>{log.role}</td>
                        <td>{log.action}</td>
                        <td>{log.resource}</td>
                        <td>{log.encryptedRecordId}</td>
                        <td>
                          <StatusPill value={log.status} />
                        </td>
                        <td>{toReadableDate(log.accessedAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel-block">
            <div className="panel-header">
              <h2>Anomaly Reports</h2>
            </div>
            <div className="filters">
              <input
                placeholder="Search source, summary, record"
                value={anomalySearch}
                onChange={(e) => setAnomalySearch(e.target.value)}
              />
              <select value={anomalySeverity} onChange={(e) => setAnomalySeverity(e.target.value)}>
                <option value="">All severity</option>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="critical">critical</option>
              </select>
              <select value={anomalyStatus} onChange={(e) => setAnomalyStatus(e.target.value)}>
                <option value="">All status</option>
                <option value="open">open</option>
                <option value="investigating">investigating</option>
                <option value="resolved">resolved</option>
              </select>
              <button disabled={isLoading} onClick={loadAnomalyReports}>
                Apply Filters
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Severity</th>
                    <th>Summary</th>
                    <th>Encrypted Record</th>
                    <th>Status</th>
                    <th>Reported At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {anomalyReports.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-state">
                        No records available.
                      </td>
                    </tr>
                  ) : (
                    anomalyReports.map((report) => (
                      <tr key={report._id}>
                        <td>{report.sourceSystem}</td>
                        <td>{report.severity}</td>
                        <td>{report.summary}</td>
                        <td>{report.encryptedRecordId}</td>
                        <td>
                          <StatusPill value={report.status} />
                        </td>
                        <td>{toReadableDate(report.reportedAt)}</td>
                        <td>
                          <select
                            value={report.status}
                            onChange={(e) => updateReportStatus(report._id, e.target.value)}
                            disabled={isLoading}
                          >
                            <option value="open">open</option>
                            <option value="investigating">investigating</option>
                            <option value="resolved">resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
