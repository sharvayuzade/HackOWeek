import "dotenv/config";
import http from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { connectDB } from "./config/db.js";
import { encryptObject } from "./utils/crypto.js";
import WearableReading from "./models/WearableReading.js";

const app = express();

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "week12-wearable-ingestion" });
});

const isValidIncomingPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const { deviceId, heartRate, steps } = payload;

  if (typeof deviceId !== "string" || !deviceId.trim()) {
    return false;
  }

  if (!Number.isFinite(heartRate) || heartRate <= 0) {
    return false;
  }

  if (!Number.isFinite(steps) || steps < 0) {
    return false;
  }

  return true;
};

const createServer = () => {
  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    if (request.url !== "/ws/wearable") {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws) => {
    ws.send(
      JSON.stringify({
        type: "connected",
        message: "Send JSON with deviceId, heartRate, steps"
      })
    );

    ws.on("message", async (rawMessage) => {
      try {
        const parsed = JSON.parse(rawMessage.toString());
        if (!isValidIncomingPayload(parsed)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid payload. Required: deviceId(string), heartRate(number), steps(number)"
            })
          );
          return;
        }

        const normalizedPayload = {
          deviceId: parsed.deviceId.trim(),
          heartRate: Number(parsed.heartRate),
          steps: Number(parsed.steps),
          timestamp: parsed.timestamp ? new Date(parsed.timestamp).toISOString() : new Date().toISOString()
        };

        const encrypted = encryptObject(normalizedPayload);

        const saved = await WearableReading.create({
          deviceId: normalizedPayload.deviceId,
          encryptedPayload: encrypted.encryptedPayload,
          iv: encrypted.iv,
          authTag: encrypted.authTag
        });

        ws.send(
          JSON.stringify({
            type: "ack",
            message: "Payload received and stored",
            recordId: saved._id
          })
        );
      } catch (error) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: error.message || "Failed to process message"
          })
        );
      }
    });
  });

  return httpServer;
};

const startServer = async () => {
  try {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error("ENCRYPTION_KEY is required in environment variables");
    }

    await connectDB();
    const server = createServer();
    const port = Number(process.env.PORT || 5001);

    server.listen(port, () => {
      console.log(`HTTP API listening at http://localhost:${port}`);
      console.log(`WebSocket endpoint listening at ws://localhost:${port}/ws/wearable`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();