import { Request, Response } from "express";
import Event from "../models/event.model";
import Ticket from "../models/ticket.model";
import { IUserDocument } from "../types/types";
import { cacheGet, cacheSet } from "../utils/cache";

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

    // ─── Cache-aside: check Redis first ─────────────────────
    const cacheKey = `organizer:stats:${id}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Aggregate stats from Tickets
    const stats = await Ticket.aggregate([
      { $match: { eventId: event._id, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          totalTicketsSold: { $sum: 1 },
        },
      },
    ]);

    const totalTicketsSold = stats[0]?.totalTicketsSold || 0;
    const revenue = totalTicketsSold * event.price;
    const checkedInCount = await Ticket.countDocuments({
      eventId: event._id,
      status: "used",
    });

    const responseData = {
      event,
      stats: {
        totalTicketsSold,
        revenue,
        checkedInCount,
        remaining: totalTicketsSold - checkedInCount,
        capacity: event.capacity,
        remainingCapacity: event.capacity - totalTicketsSold,
      },
    };

    // Cache for 60 seconds
    await cacheSet(cacheKey, responseData, 60);

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
