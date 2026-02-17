import mongoose, { Schema } from "mongoose";
import { IPaymentTransaction } from "../types/types";

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String, required: true, unique: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    organizerShare: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true },
);

// Compound indexes for common queries
paymentTransactionSchema.index({ userId: 1, createdAt: -1 });
paymentTransactionSchema.index({ organizerId: 1, createdAt: -1 });
paymentTransactionSchema.index({ eventId: 1, status: 1 });

export default mongoose.model<IPaymentTransaction>(
  "PaymentTransaction",
  paymentTransactionSchema,
);
