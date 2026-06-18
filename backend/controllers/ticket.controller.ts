import { Request, Response } from "express";
import mongoose from "mongoose";
import Ticket from "../models/ticket.model";
import { IUserDocument } from "../types/types";

export const getUserTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as IUserDocument)?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = new Date();

    const aggregatePipeline: any[] = [
      { $match: { userId: new mongoose.Types.ObjectId(userId.toString()) } },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isUpcoming: {
            $and: [
              { $eq: ["$status", "valid"] },
              {
                $gte: [
                  { $ifNull: ["$event.endDate", "$event.startDate"] },
                  now,
                ],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          sortPriority: { $cond: { if: "$isUpcoming", then: 1, else: 0 } },
          // For upcoming, we want nearest first (ascending startDate)
          // For past, we want most recent first (descending startDate)
          // We can't easily do dual-direction sort in one field without tricks.
          // But we can sort by sortPriority DESC first.
        },
      },
      {
        $sort: {
          sortPriority: -1,
          "event.startDate": 1, // This works for upcoming. For past, we might need a separate query or nested aggregation if strict order is needed.
        },
      },
      {
        $project: {
          eventId: "$event",
          status: 1,
          userId: 1,
          createdAt: 1,
          updatedAt: 1,
          isUpcoming: 1,
          // include other fields if necessary
        },
      },
    ];

    const tickets = await Ticket.aggregate(aggregatePipeline);

    res.status(200).json({ tickets });
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
