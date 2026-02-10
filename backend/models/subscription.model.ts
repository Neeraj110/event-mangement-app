import mongoose, { Schema } from "mongoose";
import { ISubscription } from "../types/types";

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: {
      type: String,
      enum: ["free", "pro"],
      required: true,
    },
    stripeCustomerId: { type: String, required: true },
    stripeSubscriptionId: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "cancelled"],
      required: true,
    },
    currentPeriodEnd: { type: Date, required: true },
  },
  { timestamps: false },
);

export default mongoose.model<ISubscription>(
  "Subscription",
  subscriptionSchema,
);
