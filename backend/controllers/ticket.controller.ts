import { Response } from "express";
import { AuthenticatedRequest } from "../types/types";
import Ticket from "../models/ticket.model";

export const getUserTickets = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.user?._id;

    const tickets = await Ticket.find({ userId })
      .populate({
        path: "eventId",
        select: "title coverImage startDate location",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getTicketById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { id } = req.params;
  try {
    const ticket = await Ticket.findOne({
      _id: id,
      userId: req.user?._id,
    }).populate("eventId");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
