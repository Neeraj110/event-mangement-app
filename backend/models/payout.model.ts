import mongoose, { Schema } from "mongoose";
import { IPayout } from "../types/types";

const payoutSchema = new Schema<IPayout>(
  {
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "paid"],
      required: true,
    },
    paidAt: { type: Date },
  },
  { timestamps: false },
);

export default mongoose.model<IPayout>("Payout", payoutSchema);
