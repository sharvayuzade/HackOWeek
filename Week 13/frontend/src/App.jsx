import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Line,
  Bar,
  ComposedChart,
  Area,
  AreaChart
} from "recharts";

const numberFormatter = new Intl.NumberFormat("en-IN");

const buildSyntheticData = (days, requestedDeviceId) => {
  const normalizedDevice = requestedDeviceId.trim() || "watch-demo-101";
  const dailyTrends = [];
  const recentReadings = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const dayDate = new Date();
    dayDate.setHours(0, 0, 0, 0);
    dayDate.setDate(dayDate.getDate() - index);

    const dayWave = Math.sin((days - index) / 3.2);
    const weekdayBias = [0.92, 0.98, 1.04, 1.08, 1.1, 0.94, 0.9][dayDate.getDay()];
    const readings = Math.max(4, Math.round(6 + (dayWave + 1) * 3));
    const totalSteps = Math.round((4200 + (dayWave + 1) * 1700 + (days - index) * 60) * weekdayBias);
    const avgHeartRate = Math.round((72 + (dayWave + 1) * 6 + (Math.random() * 2 - 1)) * 10) / 10;

    dailyTrends.push({
      date: dayDate.toISOString().slice(0, 10),
      totalSteps,
      avgHeartRate,
      readings
    });

    for (let sample = 0; sample < Math.min(readings, 3); sample += 1) {
      const readingTime = new Date(dayDate);
      readingTime.setHours(8 + sample * 4, 10 + sample * 7, 0, 0);
      recentReadings.push({
        id: `${dayDate.toISOString()}-${sample}`,
        deviceId: normalizedDevice,
        timestamp: readingTime.toISOString(),
        heartRate: Math.max(58, Math.round(avgHeartRate + (Math.random() * 8 - 4))),
        steps: Math.round(totalSteps * (0.2 + sample * 0.2))
      });
    }
  }

  return {
    summary: {
      daysRequested: days,
      deviceFilter: normalizedDevice,
      recordsFetched: recentReadings.length,
      recordsDecrypted: recentReadings.length,
      firstDate: dailyTrends[0]?.date || null,
      lastDate: dailyTrends[dailyTrends.length - 1]?.date || null
    },
    dailyTrends,
    recentReadings: recentReadings.slice(-20).reverse()
  };
};

function App() {
  const [days, setDays] = useState(14);
  const [deviceId, setDeviceId] = useState("");
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrends = async () => {
    setLoading(true);

    const payload = buildSyntheticData(days, deviceId);
    setData(payload.dailyTrends || []);
    setSummary(payload.summary || null);
    setRecentReadings(payload.recentReadings || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const totalSteps = data.reduce((sum, row) => sum + (row.totalSteps || 0), 0);
    const avgHeartRate =
      data.length > 0
        ? Math.round((data.reduce((sum, row) => sum + (row.avgHeartRate || 0), 0) / data.length) * 10) / 10
        : 0;

    return {
      daysShown: data.length,
      totalSteps,
      avgHeartRate
    };
  }, [data]);

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>Daily Activity Dashboard</h1>
          <p>Synthetic preview trends for steps and heart rate</p>
        </div>
        <div className="controls">
          <label>
            Days
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
              <option value={7}>7</option>
              <option value={14}>14</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
            </select>
          </label>
          <label>
            Device ID
            <input
              type="text"
              placeholder="optional"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            />
          </label>
          <button onClick={fetchTrends} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <article className="card stat">
          <h2>Total Steps</h2>
          <strong>{numberFormatter.format(totals.totalSteps)}</strong>
        </article>
        <article className="card stat">
          <h2>Average Heart Rate</h2>
          <strong>{totals.avgHeartRate} bpm</strong>
        </article>
        <article className="card stat">
          <h2>Days in View</h2>
          <strong>{totals.daysShown}</strong>
        </article>
        <article className="card stat">
          <h2>Synthetic Records</h2>
          <strong>{numberFormatter.format(summary?.recordsDecrypted || 0)}</strong>
        </article>
      </section>

      <section className="charts-grid">
        <article className="card chart-card">
          <h3>Steps and Heart Rate Trend</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6dde6" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalSteps" fill="#2a6f97" name="Total Steps" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgHeartRate"
                  stroke="#ef6f6c"
                  strokeWidth={2}
                  dot={false}
                  name="Avg Heart Rate"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card chart-card">
          <h3>Daily Reading Volume</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6dde6" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="readings" stroke="#3d5a80" fill="#98c1d9" name="Readings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="card table-card">
        <h3>Recent Synthetic Readings</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Device</th>
                <th>Heart Rate</th>
                <th>Steps</th>
              </tr>
            </thead>
            <tbody>
              {recentReadings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-row">
                    No decrypted readings available for selected filters
                  </td>
                </tr>
              ) : (
                recentReadings.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                    <td>{item.deviceId}</td>
                    <td>{item.heartRate ?? "-"}</td>
                    <td>{item.steps ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
