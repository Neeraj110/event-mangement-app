import mongoose, { Schema } from "mongoose";
import { ITicket } from "../types/types";

const ticketSchema = new Schema<ITicket>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ticketCode: { type: String, required: true, unique: true },
    qrPayload: { type: String, required: true },
    status: {
      type: String,
      enum: ["valid", "used", "cancelled"],
      default: "valid",
    },
    checkedInAt: { type: Date },
  },
  { timestamps: true },
);

// Indexes for fast lookups
ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ eventId: 1, status: 1 });

export default mongoose.model<ITicket>("Ticket", ticketSchema);
