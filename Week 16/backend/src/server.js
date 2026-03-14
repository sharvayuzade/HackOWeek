import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import alertsRoutes from "./routes/alertsRoutes.js";
import demoRoutes from "./routes/demoRoutes.js";
import streamRoutes from "./routes/streamRoutes.js";
import { seedDemoData } from "./services/demoService.js";
import { setSocketServer } from "./services/streamProcessor.js";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../../frontend");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(frontendPath));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "week16-realtime-alert-system"
  });
});

app.use("/api/stream", streamRoutes);
app.use("/api/alerts", alertsRoutes);
app.use("/api/demo", demoRoutes);

app.get("*", (_req, res) => {
  res.sendFile(path.resolve(frontendPath, "index.html"));
});

io.on("connection", (socket) => {
  socket.emit("system:status", {
    connected: true,
    timestamp: new Date().toISOString()
  });
});

setSocketServer(io);

const startServer = async () => {
  try {
    await connectDB();

    if ((process.env.AUTO_SEED_DEMO || "true").toLowerCase() === "true") {
      const result = await seedDemoData({ force: false });
      if (!result.skipped) {
        console.log(
          `Demo seed completed: ${result.insertedReadings} readings, ${result.insertedAlerts} alerts`
        );
      }
    }

    const port = Number(process.env.PORT || 5016);
    httpServer.listen(port, () => {
      console.log(`Week 16 server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();