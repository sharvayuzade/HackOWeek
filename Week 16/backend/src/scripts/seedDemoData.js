import "dotenv/config";
import { connectDB } from "../config/db.js";
import AlertEvent from "../models/AlertEvent.js";
import { seedDemoData } from "../services/demoService.js";

const run = async () => {
  try {
    await connectDB();
    await AlertEvent.deleteMany({});
    const result = await seedDemoData({ force: true });
    console.log(`Seeded ${result.insertedReadings} readings and ${result.insertedAlerts} alerts`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

run();