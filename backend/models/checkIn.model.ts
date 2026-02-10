import mongoose, { Schema } from "mongoose";
import { ICheckIn } from "../types/types";

const checkInSchema = new Schema<ICheckIn>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket", required: true },
    scannedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scannedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

export default mongoose.model<ICheckIn>("CheckIn", checkInSchema);
