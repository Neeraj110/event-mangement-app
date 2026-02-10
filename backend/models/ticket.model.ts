import mongoose, { Schema } from "mongoose";
import { ITicket } from "../types/types";

const ticketSchema = new Schema<ITicket>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    ticketCode: { type: String, required: true },
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

export default mongoose.model<ITicket>("Ticket", ticketSchema);
