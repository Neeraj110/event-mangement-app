import { Request, Response } from "express";
import Subscription from "../models/subscription.model";
import { IUserDocument } from "../types/types";
import User from "../models/user.model";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

export const createSubscription = async (req: Request, res: Response) => {
  const { priceId } = req.body; // Stripe Price ID from frontend
  const userId = (req.user as IUserDocument)?._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Create Stripe Customer if not exists
    let customerId = user.stripeCustomerId; // Assuming you add this field to User model
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // 2. Create Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice & {
      payment_intent: Stripe.PaymentIntent;
    };
    const paymentIntent = invoice.payment_intent;

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Subscription creation failed", error: error.message });
  }
};

export const getSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as IUserDocument | undefined;
    const user = await User.findById(currentUser?._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // In a real app, you might sync this status via webhooks to your DB
    // For now, let's assume we return what's in the User model or fetch from Stripe

    // Simplified: returning user role/status
    res.status(200).json({
      isPremium: user.isPremium || false, // Assuming isPremium field
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
