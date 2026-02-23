import { Request, Response } from "express";
import { setRefreshTokenCookie } from "../utils/cookie";
import User from "../models/user.model";
import Event from "../models/event.model";
import PaymentTransaction from "../models/paymentTransaction.model";
import Payout from "../models/payout.model";
import mongoose from "mongoose";

// ─── Public: Check if an admin already exists ─────────────
export const checkAdminExists = async (req: Request, res: Response) => {
  try {
    const admin = await User.findOne({ role: "admin" });
    res.status(200).json({ exists: !!admin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ─── Public: Register the first (and only) admin ──────────
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return res.status(403).json({
        message: "An admin account already exists. Only one admin is allowed.",
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "A user with this email already exists." });
    }

    const user = new User({
      name,
      email,
      password,
      role: "admin",
    });
    await user.save();

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: "Admin account created successfully",
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find().populate("organizerId", "name email");
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteEventByAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    // TODO: Also delete related tickets and cancel payments if necessary
    res.status(200).json({ message: "Event deleted by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const payments = await PaymentTransaction.find().populate("userId eventId");
    res.status(200).json({ payments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ─── Organizer Payment Summaries ──────────────────────────
export const getOrganizerPaymentSummaries = async (
  req: Request,
  res: Response,
) => {
  try {
    // 1. Aggregate total earned per organizer from successful transactions
    const earningsAgg = await PaymentTransaction.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: "$organizerId",
          totalEarned: { $sum: "$organizerShare" },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    // 2. Aggregate total paid per organizer from Payout records
    const payoutsAgg = await Payout.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: "$organizerId",
          totalPaid: { $sum: "$amount" },
          payoutCount: { $sum: 1 },
        },
      },
    ]);

    // Build a map of payouts by organizer
    const payoutsMap = new Map<
      string,
      { totalPaid: number; payoutCount: number }
    >();
    for (const p of payoutsAgg) {
      payoutsMap.set(p._id.toString(), {
        totalPaid: p.totalPaid,
        payoutCount: p.payoutCount,
      });
    }

    // 3. Get organizer details
    const organizerIds = earningsAgg.map((e) => e._id);
    const organizers = await User.find(
      { _id: { $in: organizerIds } },
      "name email",
    );
    const organizerMap = new Map<string, { name: string; email: string }>();
    for (const o of organizers) {
      organizerMap.set(o._id.toString(), { name: o.name, email: o.email });
    }

    // 4. Build summaries
    const summaries = earningsAgg.map((earning) => {
      const orgId = earning._id.toString();
      const organizer = organizerMap.get(orgId);
      const payout = payoutsMap.get(orgId);
      const totalEarned = earning.totalEarned;
      const totalPaid = payout?.totalPaid || 0;
      const remainingAmount = totalEarned - totalPaid;

      let paymentStatus: "fully_paid" | "partially_paid" | "unpaid";
      if (remainingAmount <= 0) {
        paymentStatus = "fully_paid";
      } else if (totalPaid > 0) {
        paymentStatus = "partially_paid";
      } else {
        paymentStatus = "unpaid";
      }

      return {
        organizerId: orgId,
        organizerName: organizer?.name || "Unknown",
        organizerEmail: organizer?.email || "",
        totalEarned: Math.round(totalEarned * 100) / 100,
        totalPaid: Math.round(totalPaid * 100) / 100,
        remainingAmount: Math.round(remainingAmount * 100) / 100,
        paymentStatus,
        transactionCount: earning.transactionCount,
        payoutCount: payout?.payoutCount || 0,
      };
    });

    // Sort: unpaid first, then partially_paid, then fully_paid
    const statusOrder = { unpaid: 0, partially_paid: 1, fully_paid: 2 };
    summaries.sort(
      (a, b) => statusOrder[a.paymentStatus] - statusOrder[b.paymentStatus],
    );

    res.status(200).json({ summaries });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ─── Approve Payout ───────────────────────────────────────
export const approvePayout = async (req: Request, res: Response) => {
  const { organizerId, amount } = req.body;

  try {
    // 1. Validate inputs
    if (!organizerId || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Valid organizer ID and amount are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(organizerId)) {
      return res.status(400).json({ message: "Invalid organizer ID." });
    }

    // 2. Verify organizer exists
    const organizer = await User.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found." });
    }
    if (organizer.role !== "organizer") {
      return res.status(400).json({ message: "User is not an organizer." });
    }

    // 3. Calculate remaining balance
    const earningsAgg = await PaymentTransaction.aggregate([
      {
        $match: {
          organizerId: new mongoose.Types.ObjectId(organizerId),
          status: "success",
        },
      },
      { $group: { _id: null, totalEarned: { $sum: "$organizerShare" } } },
    ]);
    const totalEarned = earningsAgg[0]?.totalEarned || 0;

    const payoutsAgg = await Payout.aggregate([
      {
        $match: {
          organizerId: new mongoose.Types.ObjectId(organizerId),
          status: "paid",
        },
      },
      { $group: { _id: null, totalPaid: { $sum: "$amount" } } },
    ]);
    const totalPaid = payoutsAgg[0]?.totalPaid || 0;

    const remainingBalance = totalEarned - totalPaid;

    if (amount > remainingBalance) {
      return res.status(400).json({
        message: `Amount exceeds remaining balance. Remaining: ₹${remainingBalance.toFixed(2)}`,
      });
    }

    // 4. Create Payout record
    const payout = new Payout({
      organizerId,
      amount,
      periodStart: new Date(0), // historical — covers all time
      periodEnd: new Date(),
      status: "paid",
      paidAt: new Date(),
    });
    await payout.save();

    const newRemaining = remainingBalance - amount;

    res.status(200).json({
      message: `Payout of ₹${amount} approved for ${organizer.name}`,
      payout,
      updatedBalance: {
        totalEarned: Math.round(totalEarned * 100) / 100,
        totalPaid: Math.round((totalPaid + amount) * 100) / 100,
        remainingAmount: Math.round(newRemaining * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ─── Toggle event publish status ──────────────────────────
export const toggleEventPublish = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.isPublished = !event.isPublished;
    await event.save();

    res.status(200).json({
      message: `Event ${event.isPublished ? "published" : "unpublished"} successfully`,
      event,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
