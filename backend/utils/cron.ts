import cron from "node-cron";
import Event from "../models/event.model";

/**
 * Archive past events — runs daily at midnight.
 * Sets isArchived = true on events whose endDate has passed.
 * Tickets and payment records remain intact for user history.
 */
export function startEventArchiveCron() {
  // Run every day at 00:00
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();
      const result = await Event.updateMany(
        { endDate: { $lt: now }, isArchived: { $ne: true } },
        { $set: { isArchived: true } },
      );
      if (result.modifiedCount > 0) {
        console.log(
          `📦 Archived ${result.modifiedCount} past event(s) at ${now.toISOString()}`,
        );
      }
    } catch (error) {
      console.error("❌ Event archive cron failed:", error);
    }
  });

  console.log("⏰ Event archive cron scheduled (daily at midnight)");
}
