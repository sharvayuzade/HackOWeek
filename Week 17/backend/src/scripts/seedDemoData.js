import "dotenv/config";
import { connectDB } from "../config/db.js";
import { seedDemoData } from "../services/demoService.js";

const run = async () => {
  try {
    await connectDB();
    const result = await seedDemoData({ force: true });
    console.log(`Seeded ${result.inserted} records`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

run();