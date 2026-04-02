import "dotenv/config";
import cors from "cors";
import express from "express";
import adminRoutes from "./routes/adminRoutes.js";
import { connectToDatabase } from "./config/db.js";
import { attachUser } from "./middleware/auth.js";

const app = express();
const port = Number(process.env.PORT || 5019);

app.use(cors());
app.use(express.json());
app.use(attachUser);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "week19-admin-compliance" });
});

app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: "internal_server_error",
    message: "Something went wrong."
  });
});

async function startServer() {
  try {
    await connectToDatabase({
      mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/",
      dbName: process.env.MONGO_DB_NAME || "week19_admin_compliance"
    });

    app.listen(port, () => {
      console.log(`Week 19 backend running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
