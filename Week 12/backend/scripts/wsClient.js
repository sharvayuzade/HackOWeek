import { WebSocket } from "ws";

const wsUrl = process.env.WS_URL || "ws://localhost:5001/ws/wearable";
const deviceId = process.env.DEVICE_ID || "watch-101";

const buildPayload = () => {
  const heartRate = Number(process.env.HEART_RATE || 82);
  const steps = Number(process.env.STEPS || 4512);

  return {
    deviceId,
    heartRate,
    steps,
    timestamp: new Date().toISOString()
  };
};

const ws = new WebSocket(wsUrl);

ws.on("open", () => {
  const payload = buildPayload();
  console.log("Connected to WebSocket server");
  console.log("Sending payload:", payload);
  ws.send(JSON.stringify(payload));
});

ws.on("message", (data) => {
  console.log("Server response:", data.toString());
  ws.close();
});

ws.on("close", () => {
  console.log("WebSocket closed");
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error.message);
  process.exit(1);
});