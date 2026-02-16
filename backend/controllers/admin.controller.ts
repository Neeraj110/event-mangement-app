import { Request, Response } from "express";
import User from "../models/user.model";
import Event from "../models/event.model";
import PaymentTransaction from "../models/paymentTransaction.model";

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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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

export const approvePayout = async (req: Request, res: Response) => {
  const { organizerId, amount } = req.body;
  try {
    // Logic to transfer funds via Stripe Connect or record payout
    res.status(200).json({
      message: `Payout of $${amount} approved for organizer ${organizerId}`,
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
