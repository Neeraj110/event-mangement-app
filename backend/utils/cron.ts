import cron from "node-cron";
import Event from "../models/event.model";
import Subscription from "../models/subscription.model";
import User from "../models/user.model";

// Archive events that have ended
export function startEventArchiveCron() {
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

export function startSubscriptionExpiryCron() {
  cron.schedule("0 1 * * *", async () => {
    try {
      const now = new Date();
      const expiredSubs = await Subscription.find({
        status: "active",
        currentPeriodEnd: { $lt: now },
      });

      for (const sub of expiredSubs) {
        sub.status = "cancelled";
        await sub.save();
        await User.findByIdAndUpdate(sub.userId, { isPremium: false });
        console.log(`🔌 Expired subscription for user ${sub.userId}`);
      }
    } catch (err) {
      console.error("❌ Subscription expiry cron failed:", err);
    }
  });

  console.log("⏰ Subscription expiry cron scheduled (daily at 1:00 AM)");
}
