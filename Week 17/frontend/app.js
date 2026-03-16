const tableBodyEl = document.getElementById("tableBody");
const recordCountEl = document.getElementById("recordCount");
const tokenInputEl = document.getElementById("tokenInput");

const seedBtn = document.getElementById("seedBtn");
const refreshBtn = document.getElementById("refreshBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }

  return response.json();
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : "-";
};

const renderTable = (records) => {
  recordCountEl.textContent = `${records.length} records`;

  if (!records.length) {
    tableBodyEl.innerHTML = `<tr><td colspan="7" class="text-muted">No data available</td></tr>`;
    return;
  }

  tableBodyEl.innerHTML = records
    .map((record) => {
      const status = record.isAnomaly
        ? `Anomaly (${record.anomalyReasons.join(", ")})`
        : "Normal";

      return `
        <tr class="${record.isAnomaly ? "anomaly" : ""}">
          <td>${formatTime(record.capturedAt)}</td>
          <td>${record.deviceId}</td>
          <td>${record.bpm}</td>
          <td>${record.steps}</td>
          <td>${record.stressIndex}</td>
          <td>${record.anomalyScore}</td>
          <td>${status}</td>
        </tr>
      `;
    })
    .join("");
};

const loadRecords = async () => {
  const payload = await fetchJson("/api/data/recent?limit=100");
  renderTable(payload.records || []);
};

const downloadExport = async (type) => {
  const token = tokenInputEl.value.trim();
  if (!token) {
    alert("Export token is required");
    return;
  }

  const response = await fetch(`/api/export/${type}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Export failed: ${response.status}`);
  }

  const blob = await response.blob();
  const extension = type === "csv" ? "csv" : "pdf";
  const fileName = `week17-export.${extension}`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

seedBtn.addEventListener("click", async () => {
  await fetchJson("/api/demo/seed", {
    method: "POST",
    body: JSON.stringify({ force: true })
  });
  await loadRecords();
});

refreshBtn.addEventListener("click", async () => {
  await loadRecords();
});

exportCsvBtn.addEventListener("click", async () => {
  await downloadExport("csv");
});

exportPdfBtn.addEventListener("click", async () => {
  await downloadExport("pdf");
});

loadRecords().catch((error) => {
  console.error("Failed to load records:", error.message);
});