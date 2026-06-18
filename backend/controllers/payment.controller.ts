import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import { IUserDocument } from "../types/types";
import Event from "../models/event.model";
import PaymentTransaction from "../models/paymentTransaction.model";
import Ticket from "../models/ticket.model";
import { v4 as uuidv4 } from "uuid";
import { cacheDelete, cacheDeletePattern } from "../utils/cache";
import { getIO } from "../config/socket";
import { getRedis } from "../config/redis";

let _razorpay: InstanceType<typeof Razorpay> | null = null;
function getRazorpay() {
  if (!_razorpay) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
      throw new Error("RAZORPAY_KEY_ID and RAZORPAY_SECRET must be set");
    }
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  }
  return _razorpay;
}

export const createOrder = async (req: Request, res: Response) => {
  const { eventId, quantity } = req.body;
  const userId = (req.user as IUserDocument)?._id;

  try {
    // Validate input
    const qty = parseInt(quantity?.toString() || "1");
    if (qty < 1 || qty > 10) {
      return res
        .status(400)
        .json({ message: "Quantity must be between 1 and 10" });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // Validate event exists and is published
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (!event.isPublished) {
      return res.status(400).json({ message: "Event is not available" });
    }
    if (event.endDate < new Date()) {
      return res.status(400).json({ message: "Cannot buy tickets for past events" });
    }

    // Check capacity before creating order
    const soldTickets = await Ticket.countDocuments({
      eventId,
      status: { $ne: "cancelled" },
    });
    if (soldTickets + qty > event.capacity) {
      return res.status(400).json({
        message: `Only ${event.capacity - soldTickets} ticket(s) remaining`,
      });
    }

    const amount = event.price * qty;

    // Create Razorpay order (amount in paise for INR)
    const order = await getRazorpay().orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: userId?.toString() || "",
        eventId,
        quantity: qty.toString(),
        eventTitle: event.title,
      },
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    eventId,
    quantity,
  } = req.body;
  const userId = (req.user as IUserDocument)?._id;

  try {
    // ─── Input Validation ─────────────────────────────────
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !eventId
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ─── 1. Cryptographic Signature Verification ──────────
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.warn(
        `⚠️ Signature mismatch for order ${razorpay_order_id} by user ${userId}`,
      );
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // ─── 2. Idempotency Check ─────────────────────────────
    const existingTransaction = await PaymentTransaction.findOne({
      razorpayPaymentId: razorpay_payment_id,
    });

    if (existingTransaction) {
      return res.status(200).json({
        message: "Payment already processed",
        transactionId: existingTransaction._id,
      });
    }

    // ─── 3. Server-side Payment Verification via Razorpay API ──
    let paymentDetails: any;
    try {
      paymentDetails = await getRazorpay().payments.fetch(razorpay_payment_id);
    } catch (fetchErr: any) {
      console.error("Failed to fetch payment from Razorpay:", fetchErr);
      return res
        .status(502)
        .json({ message: "Could not verify payment with Razorpay" });
    }

    if (paymentDetails.status !== "captured") {
      return res.status(400).json({
        message: `Payment not captured. Status: ${paymentDetails.status}`,
      });
    }

    // Verify amount matches
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const qty = parseInt(quantity?.toString() || "1");
    const expectedAmountPaise = Math.round(event.price * qty * 100);

    if (paymentDetails.amount !== expectedAmountPaise) {
      console.error(
        `⚠️ Amount mismatch! Expected ${expectedAmountPaise}, got ${paymentDetails.amount}`,
      );
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    const redis = getRedis();
    const lockKey = `lock:event:${eventId}`;
    let acquired = false;

    for (let i = 0; i < 50; i++) {
      const res = await redis.set(lockKey, "locked", "PX", 10000, "NX");
      if (res === "OK") {
        acquired = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!acquired) {
      return res.status(429).json({
        message:
          "Server is busy processing transactions for this event. Please try again.",
      });
    }

    try {
      const soldTickets = await Ticket.countDocuments({
        eventId,
        status: { $ne: "cancelled" },
      });

      if (soldTickets + qty > event.capacity) {
        return res.status(400).json({
          message: "Event is sold out. Please contact support for a refund.",
        });
      }

      const amount = event.price * qty;
      const platformFee = amount * 0.05;
      const organizerShare = amount - platformFee;

      const transaction = new PaymentTransaction({
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        userId,
        eventId,
        organizerId: event.organizerId,
        amount,
        platformFee,
        organizerShare,
        status: "success",
      });
      await transaction.save();

      const tickets = [];
      for (let i = 0; i < qty; i++) {
        const ticketCode = `TICKET-${uuidv4().substring(0, 8).toUpperCase()}`;
        tickets.push({
          eventId,
          userId,
          ticketCode,
          qrPayload: JSON.stringify({
            ticketCode,
            eventId,
            userId,
            transactionId: transaction._id,
            timestamp: Date.now(),
          }),
          status: "valid",
        });
      }
      await Ticket.insertMany(tickets);

      console.log(
        `✅ Created ${qty} tickets for user ${userId}, event ${eventId}`,
      );

      await cacheDelete(`event:${eventId}`);
      await cacheDeletePattern("events:list:*");
      await cacheDelete(`organizer:stats:${eventId}`);
      await cacheDelete(`checkin:stats:${eventId}`);

      try {
        const totalSoldNow = soldTickets + qty;
        const remainingTickets = event.capacity - totalSoldNow;

        getIO()
          .to(`event:${eventId}`)
          .emit("tickets:update", {
            eventId,
            totalSold: totalSoldNow,
            remainingTickets,
            capacity: event.capacity,
            soldOut: remainingTickets <= 0,
          });
      } catch (socketErr) {
        console.error("Socket emission error:", socketErr);
      }

      res.status(200).json({
        message: "Payment verified and tickets created",
        transactionId: transaction._id,
        ticketCount: qty,
      });
    } finally {
      await redis.del(lockKey);
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
};
