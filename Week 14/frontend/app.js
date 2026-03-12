const ingestForm = document.getElementById("ingestForm");
const ingestMessage = document.getElementById("ingestMessage");
const recordsBody = document.getElementById("recordsBody");
const refreshBtn = document.getElementById("refreshBtn");

const setMessage = (text, type) => {
  ingestMessage.textContent = text;
  ingestMessage.className = `message ${type || ""}`.trim();
};

const renderRecords = (records) => {
  if (!records.length) {
    recordsBody.innerHTML = "<tr><td colspan='3'>No records yet</td></tr>";
    return;
  }

  recordsBody.innerHTML = records
    .map(
      (record) => `
      <tr>
        <td>${record.deviceId}</td>
        <td><code title="${record.ciphertext}">${record.ciphertext}</code></td>
        <td>${new Date(record.receivedAt).toLocaleString()}</td>
      </tr>
    `
    )
    .join("");
};

const loadRecentRecords = async () => {
  const response = await fetch("/api/wearable/recent?limit=10");
  if (!response.ok) {
    throw new Error("Failed to fetch records");
  }
  const data = await response.json();
  renderRecords(data.records || []);
};

ingestForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("Encrypting and storing...", "");

  const formData = new FormData(ingestForm);
  const payload = {
    deviceId: String(formData.get("deviceId") || "").trim(),
    heartRate: Number(formData.get("heartRate")),
    steps: Number(formData.get("steps")),
    sleepHours: Number(formData.get("sleepHours")),
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch("/api/wearable/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Ingestion failed");
    }

    setMessage(`Saved: ${data.recordId}`, "ok");
    await loadRecentRecords();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

refreshBtn.addEventListener("click", async () => {
  try {
    await loadRecentRecords();
  } catch (error) {
    setMessage(error.message, "error");
  }
});

loadRecentRecords().catch((error) => setMessage(error.message, "error"));
