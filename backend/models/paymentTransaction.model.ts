import mongoose, { Schema } from "mongoose";
import { IPaymentTransaction } from "../types/types";

const paymentTransactionSchema = new Schema<IPaymentTransaction>(
  {
    stripePaymentIntentId: { type: String, required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    organizerShare: { type: Number, required: true },
    status: {
      type: String,
      enum: ["success", "refunded"],
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPaymentTransaction>(
  "PaymentTransaction",
  paymentTransactionSchema,
);
