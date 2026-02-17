import mongoose, { Schema } from "mongoose";
import { IEvent } from "../types/types";

const eventSchema = new Schema<IEvent>(
  {
    title: { type: Schema.Types.String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: {
      city: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    coverImage: { type: String, required: true },
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Indexes for common queries
eventSchema.index({ organizerId: 1 });
eventSchema.index({ category: 1, isPublished: 1 });
eventSchema.index({ startDate: 1, isPublished: 1 });
eventSchema.index({ isPublished: 1, createdAt: -1 });

export default mongoose.model<IEvent>("Event", eventSchema);
