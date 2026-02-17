import { Request, Response } from "express";
import Subscription from "../models/subscription.model";
import { IUserDocument } from "../types/types";
import User from "../models/user.model";

export const createSubscription = async (req: Request, res: Response) => {
  const { plan } = req.body;
  const userId = (req.user as IUserDocument)?._id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check for existing active subscription
    const existingSub = await Subscription.findOne({
      userId,
      status: "active",
    });
    if (existingSub) {
      return res
        .status(400)
        .json({ message: "You already have an active subscription" });
    }

    // Create subscription (DB-only, no payment gateway for subscriptions)
    const subscription = new Subscription({
      userId,
      plan: plan || "pro",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    await subscription.save();

    // Update user premium status
    user.isPremium = true;
    await user.save();

    res.status(200).json({
      message: "Subscription created successfully",
      subscription,
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

    const subscription = await Subscription.findOne({
      userId: user._id,
      status: "active",
    });

    res.status(200).json({
      isPremium: user.isPremium || false,
      role: user.role,
      subscription: subscription || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
