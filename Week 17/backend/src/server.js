import "dotenv/config";
import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import dataRoutes from "./routes/dataRoutes.js";
import demoRoutes from "./routes/demoRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import { seedDemoData } from "./services/demoService.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../../frontend/dist");
const frontendIndexPath = path.resolve(frontendPath, "index.html");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "week17-user-data-export" });
});

app.use("/api/data", dataRoutes);
app.use("/api/demo", demoRoutes);
app.use("/api/export", exportRoutes);

app.get("*", (_req, res) => {
  if (fs.existsSync(frontendIndexPath)) {
    return res.sendFile(frontendIndexPath);
  }

  return res.status(503).send("Frontend build not found. Run npm run build in Week 17/frontend.");
});

const startServer = async () => {
  try {
    await connectDB();

    if ((process.env.AUTO_SEED_DEMO || "true").toLowerCase() === "true") {
      await seedDemoData({ force: false });
    }

    const port = Number(process.env.PORT || 5017);
    app.listen(port, () => {
      console.log(`Week 17 server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();