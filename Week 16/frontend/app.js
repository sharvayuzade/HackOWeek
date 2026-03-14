const API_BASE = "";
const CLIENT_DECRYPTION_SECRET = "demo-week16-alert-secret";
const MAX_ITEMS = 20;

const socketStatusEl = document.getElementById("socketStatus");
const alertListEl = document.getElementById("alertList");
const readingTableBodyEl = document.getElementById("readingTableBody");
const alertCountEl = document.getElementById("alertCount");
const readingCountEl = document.getElementById("readingCount");

const seedBtn = document.getElementById("seedBtn");
const startSimBtn = document.getElementById("startSimBtn");
const stopSimBtn = document.getElementById("stopSimBtn");
const injectSpikeBtn = document.getElementById("injectSpikeBtn");

const readings = [];
const alerts = [];

const updateSocketBadge = (label, className) => {
  socketStatusEl.textContent = label;
  socketStatusEl.className = `status-pill ${className}`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return Number.isFinite(date.getTime()) ? date.toLocaleTimeString() : "-";
};

const textOrDash = (value) => (value === null || value === undefined ? "-" : String(value));

const toBase64Bytes = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const getAesKey = async () => {
  const secretBytes = new TextEncoder().encode(CLIENT_DECRYPTION_SECRET);
  const digest = await crypto.subtle.digest("SHA-256", secretBytes);
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["decrypt"]);
};

const decryptNotification = async (encryptedPayload) => {
  const key = await getAesKey();
  const iv = toBase64Bytes(encryptedPayload.iv);
  const authTag = toBase64Bytes(encryptedPayload.authTag);
  const ciphertext = toBase64Bytes(encryptedPayload.ciphertext);

  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext, 0);
  combined.set(authTag, ciphertext.length);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: 128 },
    key,
    combined
  );

  return JSON.parse(new TextDecoder().decode(plaintext));
};

const renderReadings = () => {
  readingCountEl.textContent = `${readings.length} readings`;

  if (readings.length === 0) {
    readingTableBodyEl.innerHTML = `<tr><td colspan="5" class="text-muted">No readings yet</td></tr>`;
    return;
  }

  readingTableBodyEl.innerHTML = readings
    .map(
      (reading) => `
      <tr>
        <td>${formatTime(reading.capturedAt)}</td>
        <td>${textOrDash(reading.deviceId)}</td>
        <td>${textOrDash(reading.bpm)}</td>
        <td>${textOrDash(reading.spo2)}</td>
        <td>${textOrDash(reading.temperature)}</td>
      </tr>
    `
    )
    .join("");
};

const renderAlerts = () => {
  alertCountEl.textContent = `${alerts.length} received`;

  if (alerts.length === 0) {
    alertListEl.innerHTML = `<li class="text-muted">No alerts yet</li>`;
    return;
  }

  alertListEl.innerHTML = alerts
    .map(
      (alert) => `
      <li class="alert-card ${alert.severity}">
        <div class="alert-head">
          <span class="alert-title">${alert.alertType}</span>
          <span class="alert-time">${formatTime(alert.createdAt || alert.capturedAt)}</span>
        </div>
        <div><strong>Device:</strong> ${alert.deviceId}</div>
        <div><strong>BPM:</strong> ${alert.bpm}</div>
        <div>${alert.message}</div>
      </li>
    `
    )
    .join("");
};

const upsertReading = (reading) => {
  readings.unshift(reading);
  if (readings.length > MAX_ITEMS) {
    readings.pop();
  }
  renderReadings();
};

const upsertAlert = (alert) => {
  alerts.unshift(alert);
  if (alerts.length > MAX_ITEMS) {
    alerts.pop();
  }
  renderAlerts();
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};

const loadInitialData = async () => {
  const [recentReadings, recentAlerts] = await Promise.all([
    fetchJson(`${API_BASE}/api/stream/recent?limit=${MAX_ITEMS}`),
    fetchJson(`${API_BASE}/api/alerts/recent?limit=${MAX_ITEMS}`)
  ]);

  readings.splice(0, readings.length, ...recentReadings.readings);
  alerts.splice(0, alerts.length, ...recentAlerts.alerts);
  renderReadings();
  renderAlerts();
};

const initializeSocket = () => {
  const socket = io();

  socket.on("connect", () => {
    updateSocketBadge("Connected", "status-connected");
  });

  socket.on("disconnect", () => {
    updateSocketBadge("Disconnected", "status-disconnected");
  });

  socket.on("stream:reading", (reading) => {
    upsertReading(reading);
  });

  socket.on("alert:encrypted", async (encryptedAlert) => {
    try {
      const decrypted = await decryptNotification(encryptedAlert);
      upsertAlert({
        ...decrypted,
        createdAt: encryptedAlert.createdAt
      });
    } catch (error) {
      console.error("Failed to decrypt incoming alert:", error.message);
    }
  });
};

seedBtn.addEventListener("click", async () => {
  await fetchJson(`${API_BASE}/api/demo/seed`, {
    method: "POST",
    body: JSON.stringify({ force: true })
  });
  await loadInitialData();
});

startSimBtn.addEventListener("click", async () => {
  await fetchJson(`${API_BASE}/api/demo/simulate/start`, { method: "POST" });
});

stopSimBtn.addEventListener("click", async () => {
  await fetchJson(`${API_BASE}/api/demo/simulate/stop`, { method: "POST" });
});

injectSpikeBtn.addEventListener("click", async () => {
  const payload = {
    deviceId: "watch-manual",
    bpm: 148,
    spo2: 94,
    temperature: 37.4,
    capturedAt: new Date().toISOString()
  };

  await fetchJson(`${API_BASE}/api/stream/ingest`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
});

const bootstrap = async () => {
  updateSocketBadge("Connecting...", "status-pending");
  initializeSocket();
  await loadInitialData();
};

bootstrap().catch((error) => {
  console.error("Failed to initialize dashboard:", error.message);
  updateSocketBadge("Error", "status-disconnected");
});