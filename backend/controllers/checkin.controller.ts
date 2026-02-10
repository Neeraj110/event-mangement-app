import { Response } from "express";
import { AuthenticatedRequest } from "../types/types";
import Ticket from "../models/ticket.model";
import CheckIn from "../models/checkIn.model";
import Event from "../models/event.model";
import mongoose from "mongoose";
// import { redisClient } from "../config/redis"; // Assuming redis config exists or will be created
// import { io } from "../index"; // Socket io instance

export const checkInUser = async (req: AuthenticatedRequest, res: Response) => {
  const { ticketCode, eventId, location } = req.body;
  const organizerId = req.user?._id;

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
      timestamp: new Date(),
      location: location || "Main Entrance", // specific gate or location
    });
    await checkIn.save();

    // 5. Redis Increment (Live count)
    // await redisClient.incr(`event:${eventId}:checkin_count`);

    // 6. Socket Emit (Real-time update to dashboard)
    // if (io) {
    //   io.to(`event_${eventId}`).emit("new_checkin", {
    //     total: await CheckIn.countDocuments({ eventId }),
    //     lastCheckIn: checkIn
    //   });
    // }

    res.status(200).json({ message: "Check-in successful", ticket });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
