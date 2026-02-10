import mongoose, { Schema } from "mongoose";
import { IAnalyticsEvent } from "../types/types";

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    type: {
      type: String,
      enum: ["view", "click", "checkin"],
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model<IAnalyticsEvent>(
  "AnalyticsEvent",
  analyticsEventSchema,
);
