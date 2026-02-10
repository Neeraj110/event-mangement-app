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

export default mongoose.model<IEvent>("Event", eventSchema);
