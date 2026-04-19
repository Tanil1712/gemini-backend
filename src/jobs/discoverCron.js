
import cron from "node-cron";
import { generateDiscoverPost } from "../services/discoverService.js";

// ⏰ Run every 6 hours
export const startDiscoverCron = () => {
  cron.schedule("0 */6 * * *", async () => {
    console.log("🔄 Running Discover AI job...");

    await generateDiscoverPost();
  });
};

