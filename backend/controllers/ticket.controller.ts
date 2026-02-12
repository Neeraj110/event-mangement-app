import { Request, Response } from "express";
import Ticket from "../models/ticket.model";
import Event from "../models/event.model";
import { IUserDocument, AuthenticatedRequest } from "../types/types";

export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUserDocument)?._id;

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

export const getTicketById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = req.user as IUserDocument | undefined;
    const ticket = await Ticket.findOne({
      _id: id,
      userId: user?._id,
    }).populate("eventId");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
