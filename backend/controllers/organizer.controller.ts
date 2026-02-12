import { Request, Response } from "express";
import Event from "../models/event.model";
import Ticket from "../models/ticket.model";
import { IUserDocument } from "../types/types";

export const getOrganizerEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find({
      organizerId: (req.user as IUserDocument)?._id,
    }).sort({
      createdAt: -1,
    });
    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getEventStats = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const event = await Event.findOne({
      _id: id,
      organizerId: (req.user as IUserDocument)?._id,
    });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found or unauthorized" });
    }

    // Aggregate stats from Tickets
    const stats = await Ticket.aggregate([
      { $match: { eventId: event._id, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          totalTicketsSold: { $sum: 1 },
          // Revenue calculation would go here if price was stored in Ticket or joined from Event
          // For now assuming we can fetch it, but Ticket model doesn't have price.
          // We can multiply count by event price for estimation
        },
      },
    ]);

    const totalTicketsSold = stats[0]?.totalTicketsSold || 0;
    const revenue = totalTicketsSold * event.price;

    res.status(200).json({
      event,
      stats: {
        totalTicketsSold,
        revenue,
        // Live counters (checked in)
        checkedInCount: await Ticket.countDocuments({
          eventId: event._id,
          status: "used",
        }),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
