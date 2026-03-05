import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth requests. Please retry in a few minutes." }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "week11-auth-api" });
});

app.use("/api/auth", authRateLimiter, authRoutes);
app.use("/api/profiles", profileRoutes);

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required in environment variables");
    }

    if (!process.env.ENCRYPTION_KEY) {
      throw new Error("ENCRYPTION_KEY is required in environment variables");
    }

    await connectDB();
    const port = Number(process.env.PORT || 5000);
    app.listen(port, () => {
      console.log(`API running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
