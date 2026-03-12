import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import ingestRoutes from "./routes/ingestRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../../frontend");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(frontendPath));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "week14-data-encryption-pipeline" });
});

app.use("/api/wearable", ingestRoutes);

const startServer = async () => {
  try {
    if (!process.env.ENCRYPTION_SECRET) {
      throw new Error("ENCRYPTION_SECRET is required in environment variables");
    }

    await connectDB();
    const port = Number(process.env.PORT || 5002);
    app.listen(port, () => {
      console.log(`API running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
