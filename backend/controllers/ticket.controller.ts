import { Request, Response } from "express";
import Ticket from "../models/ticket.model";
import Event from "../models/event.model";
import { IUserDocument } from "../types/types";

/**
 * GET /api/tickets/me
 * Returns all tickets for the authenticated user, split into:
 *  - upcoming: valid tickets whose event hasn't ended yet (sorted nearest-first)
 *  - past: used/cancelled tickets or tickets whose event has ended (sorted most-recent-first)
 */
export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUserDocument)?._id;

    const tickets = await Ticket.find({ userId })
      .populate({
        path: "eventId",
        select: "title coverImage startDate endDate location category price",
      })
      .sort({ createdAt: -1 })
      .lean();

    // Separate upcoming vs past using event dates + ticket status
    const now = new Date();
    const upcoming: any[] = [];
    const past: any[] = [];

    for (const ticket of tickets) {
      const event = ticket.eventId as any;
      if (!event) {
        past.push(ticket);
        continue;
      }

      const eventEnd = new Date(event.endDate || event.startDate);
      const isUpcoming = eventEnd >= now && ticket.status === "valid";

      if (isUpcoming) {
        upcoming.push(ticket);
      } else {
        past.push(ticket);
      }
    }

    // Sort upcoming by nearest event first (ascending startDate)
    upcoming.sort((a, b) => {
      const dateA = new Date(a.eventId?.startDate || 0).getTime();
      const dateB = new Date(b.eventId?.startDate || 0).getTime();
      return dateA - dateB;
    });

    // Sort past by most recent event first (descending startDate)
    past.sort((a, b) => {
      const dateA = new Date(a.eventId?.startDate || 0).getTime();
      const dateB = new Date(b.eventId?.startDate || 0).getTime();
      return dateB - dateA;
    });

    // Return flat array with upcoming first, then past
    // (frontend already splits by date — this ordering makes both work)
    const tickets_sorted = [...upcoming, ...past];

    res.status(200).json({ tickets: tickets_sorted });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * GET /api/tickets/:id
 * Returns a single ticket by ID (only if owned by the requesting user).
 * Populates full event details for the ticket detail view.
 */
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
