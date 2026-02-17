import { z } from "zod";

export const createPaymentTransactionSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string({
      message: "Razorpay Order ID is required",
    }),
    razorpayPaymentId: z.string({
      message: "Razorpay Payment ID is required",
    }),
    eventId: z.string({ message: "Event ID is required" }),
    organizerId: z.string({ message: "Organizer ID is required" }),
    userId: z.string({ message: "User ID is required" }),
    amount: z.number({ message: "Amount is required" }),
    platformFee: z.number({ message: "Platform Fee is required" }),
    organizerShare: z.number({ message: "Organizer Share is required" }),
    status: z.enum(["success", "refunded"]),
  }),
});

export const createSubscriptionSchema = z.object({
  body: z.object({
    userId: z.string({ message: "User ID is required" }),
    plan: z.enum(["free", "pro"]),
    status: z.enum(["active", "cancelled"]),
    currentPeriodEnd: z.string({
      message: "Current Period End is required",
    }), // Date as string
  }),
});

export const createPayoutSchema = z.object({
  body: z.object({
    organizerId: z.string({ message: "Organizer ID is required" }),
    amount: z.number({ message: "Amount is required" }),
    periodStart: z.string({ message: "Period Start is required" }),
    periodEnd: z.string({ message: "Period End is required" }),
    status: z.enum(["pending", "paid"]),
  }),
});
