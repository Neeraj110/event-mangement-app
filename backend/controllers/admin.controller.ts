import { Request, Response } from "express";
import User from "../models/user.model";
import Event from "../models/event.model";
import PaymentTransaction from "../models/paymentTransaction.model";

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
