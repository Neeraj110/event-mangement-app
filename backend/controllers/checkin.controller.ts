import { Request, Response } from "express";
import Ticket from "../models/ticket.model";
import CheckIn from "../models/checkIn.model";
import Event from "../models/event.model";
import mongoose from "mongoose";
import { IUserDocument } from "../types/types";
import { cacheGet, cacheSet, cacheDelete } from "../utils/cache";
import { getIO } from "../config/socket";

export const checkInUser = async (req: Request, res: Response) => {
  const { ticketCode, eventId, location } = req.body;
  const organizerId = (req.user as IUserDocument)?._id;

  try {
    // 1. Validate Event Ownership (Only organizer or authorized staff can check in)
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizerId.toString() !== organizerId?.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to check in for this event" });
    }

    // 2. Find and Validate Ticket
    const ticket = await Ticket.findOne({ ticketCode, eventId });
    if (!ticket) {
      return res.status(404).json({ message: "Invalid ticket" });
    }

    if (ticket.status === "used") {
      return res.status(400).json({ message: "Ticket already used" });
    }
    if (ticket.status === "cancelled") {
      return res.status(400).json({ message: "Ticket is cancelled" });
    }

    // 3. Mark Ticket as Used
    ticket.status = "used";
    ticket.checkedInAt = new Date();
    await ticket.save();

    // 4. Create CheckIn Record
    const checkIn = new CheckIn({
      ticketId: ticket._id,
      eventId,
      scannedBy: organizerId,
      scannedAt: new Date(),
    });
    await checkIn.save();

    // 5. Invalidate caches
    await cacheDelete(`checkin:stats:${eventId}`);
    await cacheDelete(`organizer:stats:${eventId}`);

    // 6. Emit real-time update via Socket.io
    try {
      const totalSold = await Ticket.countDocuments({
        eventId,
        status: { $ne: "cancelled" },
      });
      const checkedIn = await Ticket.countDocuments({
        eventId,
        status: "used",
      });
      const remaining = totalSold - checkedIn;

      // Populate ticket user info for the real-time update
      const populatedTicket = await Ticket.findById(ticket._id).populate(
        "userId",
        "name email",
      );

      getIO()
        .to(`event:${eventId}`)
        .emit("checkin:update", {
          eventId,
          checkedIn,
          totalSold,
          remaining,
          capacity: event.capacity,
          allCheckedIn: totalSold > 0 && checkedIn >= totalSold,
          lastCheckIn: {
            ticketCode: ticket.ticketCode,
            userName: (populatedTicket?.userId as any)?.name || "Unknown",
            checkedInAt: ticket.checkedInAt,
          },
        });
    } catch (socketErr) {
      // Don't fail the check-in if socket emission fails
      console.error("Socket emission error:", socketErr);
    }

    res.status(200).json({ message: "Check-in successful", ticket });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Get check-in stats for an event (organizer only)
 */
export const getCheckInStats = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const organizerId = (req.user as IUserDocument)?._id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizerId.toString() !== organizerId?.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ─── Cache-aside: check Redis first ─────────────────────
    const cacheKey = `checkin:stats:${eventId}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const totalSold = await Ticket.countDocuments({
      eventId,
      status: { $ne: "cancelled" },
    });
    const checkedIn = await Ticket.countDocuments({
      eventId,
      status: "used",
    });

    const allCheckedIn = totalSold > 0 && checkedIn >= totalSold;

    const responseData = {
      checkedIn,
      totalSold,
      remaining: totalSold - checkedIn,
      capacity: event.capacity,
      allCheckedIn,
      eventTitle: event.title,
    };

    // Cache for 30 seconds (stats change frequently during live events)
    await cacheSet(cacheKey, responseData, 30);

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Get recent check-in logs for an event (organizer only)
 */
export const getCheckInLogs = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const organizerId = (req.user as IUserDocument)?._id;

  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.organizerId.toString() !== organizerId?.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const logs = await CheckIn.find({ eventId })
      .sort({ scannedAt: -1 })
      .limit(50)
      .populate({
        path: "ticketId",
        select: "ticketCode status userId",
        populate: { path: "userId", select: "name email" },
      });

    res.status(200).json({ logs });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
