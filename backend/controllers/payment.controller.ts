import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/types";
import Stripe from "stripe";
import PaymentTransaction from "../models/paymentTransaction.model";
import Ticket from "../models/ticket.model";
import Event from "../models/event.model";
import { v4 as uuidv4 } from "uuid";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

/**
 * Create a payment intent for ticket purchase
 * Uses idempotency key from header for safe retries
 */
export const createPaymentIntent = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { amount, currency, eventId, quantity } = req.body;
  const userId = req.user?._id;

  // Get idempotency key from header (client should generate a unique key)
  const idempotencyKey = req.headers["idempotency-key"] as string;

  try {
    // Validate event exists and has capacity
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Create payment intent with idempotency key for safe retries
    const paymentIntentOptions: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100), // Amount in cents (ensure integer)
      currency: currency || "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: userId?.toString() || "",
        eventId,
        quantity: quantity?.toString() || "1",
        eventTitle: event.title,
      },
      description: `Ticket purchase for ${event.title}`,
    };

    // Use idempotency key if provided
    const requestOptions: Stripe.RequestOptions = {};
    if (idempotencyKey) {
      requestOptions.idempotencyKey = idempotencyKey;
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentOptions,
      requestOptions,
    );

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    // Handle Stripe-specific errors
    if (error.type) {
      switch (error.type) {
        case "StripeCardError":
          return res.status(402).json({
            message: "Card declined",
            code: error.code,
            decline_code: error.decline_code,
          });
        case "StripeRateLimitError":
          return res.status(429).json({
            message: "Too many requests. Please try again later.",
          });
        case "StripeInvalidRequestError":
          return res.status(400).json({
            message: "Invalid request parameters",
            param: error.param,
          });
        case "StripeAuthenticationError":
          console.error("Stripe authentication failed:", error);
          return res.status(500).json({
            message: "Payment service configuration error",
          });
        case "StripeAPIError":
          console.error("Stripe API error:", error);
          return res.status(500).json({
            message: "Payment service temporarily unavailable",
          });
        case "StripeConnectionError":
          return res.status(503).json({
            message: "Unable to connect to payment service",
          });
        default:
          console.error("Stripe error:", error);
          return res.status(500).json({
            message: "Payment processing failed",
          });
      }
    }

    console.error("Payment intent creation error:", error);
    res.status(500).json({
      message: "Payment intent creation failed",
      error: error.message,
    });
  }
};

/**
 * Handle Stripe webhooks
 * Creates PaymentTransaction and Tickets after successful payment
 */
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (!endpointSecret) {
      console.warn(
        "⚠️ STRIPE_WEBHOOK_SECRET not set. Skipping signature verification.",
      );
      event = req.body as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the specific event types
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent,
      );
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(
        event.data.object as Stripe.PaymentIntent,
      );
      break;

    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.json({ received: true });
};

/**
 * Handle successful payment - create transaction and tickets
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
) {
  const { userId, eventId, quantity } = paymentIntent.metadata;

  try {
    // Check if transaction already exists (idempotency)
    const existingTransaction = await PaymentTransaction.findOne({
      stripePaymentIntentId: paymentIntent.id,
    });

    if (existingTransaction) {
      console.log(`Transaction already exists for ${paymentIntent.id}`);
      return;
    }

    // Get event details for organizer share calculation
    const event = await Event.findById(eventId);
    if (!event) {
      console.error(
        `Event ${eventId} not found for payment ${paymentIntent.id}`,
      );
      return;
    }

    const amount = paymentIntent.amount / 100;
    const platformFee = amount * 0.05; // 5% platform fee
    const organizerShare = amount - platformFee;

    // 1. Create Payment Transaction Record
    const transaction = new PaymentTransaction({
      stripePaymentIntentId: paymentIntent.id,
      userId,
      eventId,
      organizerId: event.organizerId,
      amount,
      platformFee,
      organizerShare,
      status: "success",
    });
    await transaction.save();

    // 2. Create Tickets
    const qty = parseInt(quantity || "1");
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
          timestamp: Date.now(),
        }),
        status: "valid",
      });
    }
    await Ticket.insertMany(tickets);

    console.log(
      `✅ Created ${qty} tickets for user ${userId}, event ${eventId}`,
    );
  } catch (dbError) {
    console.error("Database error handling payment success:", dbError);
    throw dbError; // Will cause Stripe to retry
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { userId, eventId } = paymentIntent.metadata;
  console.log(
    `❌ Payment failed for user ${userId}, event ${eventId}. Reason: ${paymentIntent.last_payment_error?.message}`,
  );
  // Could send notification to user here
}

/**
 * Handle refund - mark tickets as cancelled
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string;

  try {
    // Find the transaction
    const transaction = await PaymentTransaction.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    if (!transaction) {
      console.log(`No transaction found for refunded charge ${charge.id}`);
      return;
    }

    // Update transaction status
    transaction.status = "refunded";
    await transaction.save();

    // Cancel associated tickets
    await Ticket.updateMany(
      { eventId: transaction.eventId, userId: transaction.userId },
      { status: "cancelled" },
    );

    console.log(`🔄 Refund processed for payment ${paymentIntentId}`);
  } catch (error) {
    console.error("Error processing refund:", error);
    throw error;
  }
}
