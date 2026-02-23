import { Request, Response } from "express";
import { IUserDocument } from "../types/types";
import { createEventSchema, updateEventSchema } from "../schemas/event.schema";
import Event from "../models/event.model";
import Ticket from "../models/ticket.model";
import User from "../models/user.model";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary";
import {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
} from "../utils/cache";

export const createEvent = async (req: Request, res: Response) => {
  const validation = createEventSchema.safeParse({ body: req.body });
  const coverImage = req.file;
  const organizerId = (req.user as IUserDocument)?._id;
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.format() });
  }

  const {
    title,
    description,
    category,
    location,
    startDate,
    endDate,
    price,
    capacity,
  } = validation.data.body;

  try {
    let uploadedImage;
    if (coverImage) {
      uploadedImage = await uploadOnCloudinary(coverImage.path);
      if (!uploadedImage) {
        return res
          .status(500)
          .json({ message: "Failed to upload cover image" });
      }
    }
    const coverImageUrl = uploadedImage?.secure_url;

    const event = new Event({
      title,
      description,
      category,
      location,
      startDate,
      endDate,
      price,
      capacity,
      coverImage: coverImageUrl,
      organizerId: organizerId,
      isPublished: false, // Default to false
    });

    await event.save();

    // Invalidate event list caches
    await cacheDeletePattern("events:list:*");

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50); // Max limit 50
    const skip = (page - 1) * limit;

    // ─── Cache-aside: check Redis first ─────────────────────
    const cacheKey = `events:list:page:${page}:limit:${limit}`;
    const cached = await cacheGet<{ events: any[]; pagination: any }>(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const events = await Event.find({
      isPublished: true,
      isArchived: { $ne: true },
    })
      .sort({ startDate: -1 }) // Sort by startDate DESC
      .skip(skip)
      .limit(limit)
      .populate("organizerId", "name email");

    const total = await Event.countDocuments({
      isPublished: true,
      isArchived: { $ne: true },
    });

    const responseData = {
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache for 60 seconds
    await cacheSet(cacheKey, responseData, 60);

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // ─── Cache-aside: check Redis first ─────────────────────
    const cacheKey = `event:${id}`;
    const cached = await cacheGet<{ event: any }>(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const event = await Event.findById(id).populate(
      "organizerId",
      "name email",
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const responseData = { event };

    // Cache for 120 seconds
    await cacheSet(cacheKey, responseData, 120);

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validation = updateEventSchema.safeParse({ body: req.body });
  const coverImage = req.file;
  const currentUser = req.user as IUserDocument | undefined;

  if (!validation.success) {
    return res.status(400).json({ errors: validation.error.format() });
  }

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Authorization: Check ownership (Allow admin to bypass)
    if (
      event.organizerId.toString() !==
        (req.user as IUserDocument)?._id.toString() &&
      (req.user as IUserDocument)?.role === "organizer"
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this event" });
    }

    // Prevent modification if event has started (startDate < now)
    if (new Date(event.startDate) < new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot update past or ongoing events" });
    }

    let coverImageUrl = event.coverImage;

    // Handle Image Update
    if (req.file) {
      // Upload new image
      const uploadedImage = await uploadOnCloudinary(req.file.path);
      if (!uploadedImage) {
        return res
          .status(500)
          .json({ message: "Failed to upload new cover image" });
      }

      // Delete old image if it exists
      if (event.coverImage) {
        await deleteOnCloudinary(event.coverImage);
      }

      coverImageUrl = uploadedImage.secure_url;
    }

    const updates = validation.data.body;

    if (updates.location && event.location) {
      event.location = { ...event.location, ...updates.location } as any;
      delete updates.location;
    }

    Object.assign(event, updates);
    event.coverImage = coverImageUrl;

    await event.save();

    // Invalidate caches
    await cacheDelete(`event:${id}`);
    await cacheDeletePattern("events:list:*");

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUser = req.user as IUserDocument | undefined;

  try {
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (
      event.organizerId.toString() !==
        (req.user as IUserDocument)?._id.toString() &&
      (req.user as IUserDocument)?.role === "organizer"
    ) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this event" });
    }

    // CRITICAL: Check for sold tickets
    // Optimization: Check if ANY valid ticket exists for this event
    const soldTickets = await Ticket.exists({
      eventId: id,
      status: { $in: ["valid", "used"] },
    });

    if (soldTickets) {
      return res.status(400).json({
        message: "Cannot delete event with active or used tickets.",
      });
    }

    // Delete image from Cloudinary
    if (event.coverImage) {
      await deleteOnCloudinary(event.coverImage);
    }

    // Delete event document
    await event.deleteOne();

    // Invalidate caches
    await cacheDelete(`event:${id}`);
    await cacheDeletePattern("events:list:*");
    await cacheDelete(`checkin:stats:${id}`);
    await cacheDelete(`organizer:stats:${id}`);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ─── Personalized Events: interest-matched first ─────────
export const getPersonalizedEvents = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const baseFilter = {
      isPublished: true,
      isArchived: { $ne: true },
    };

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const user = req.user as IUserDocument | undefined;
    const interests = user?.interests || [];

    // If no user or no interests, fall back to regular events
    if (!user || interests.length === 0) {
      const cacheKey = `events:list:page:${page}:limit:${limit}`;
      const cached = await cacheGet<{ events: any[]; pagination: any }>(
        cacheKey,
      );
      if (cached) {
        return res.status(200).json(cached);
      }

      const events = await Event.find({
        ...baseFilter,
        endDate: { $gte: now },
      })
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(limit)
        .populate("organizerId", "name email");

      const total = await Event.countDocuments({
        isPublished: true,
        isArchived: { $ne: true },
      });

      const responseData = {
        events,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
        personalized: false,
      };

      await cacheSet(cacheKey, responseData, 60);
      return res.status(200).json(responseData);
    }

    // Personalized: cache by user ID + page
    const cacheKey = `events:personalized:${user._id}:page:${page}:limit:${limit}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Fetch interest-matched events (category matches user interests)
    // No need to redeclare baseFilter, it's already defined at the top of the function.

    // Case-insensitive interest matching
    const interestRegexes = interests.map(
      (i: string) => new RegExp(`^${i}$`, "i"),
    );

    const [matchedEvents, otherEvents] = await Promise.all([
      Event.find({
        ...baseFilter,
        category: { $in: interestRegexes },
        endDate: { $gte: now },
      })
        .sort({ startDate: 1 })
        .populate("organizerId", "name email"),
      Event.find({
        ...baseFilter,
        category: { $nin: interestRegexes },
        endDate: { $gte: now },
      })
        .sort({ startDate: 1 })
        .populate("organizerId", "name email"),
    ]);

    // Combine: interest-matched first, then the rest
    const allEvents = [...matchedEvents, ...otherEvents];
    const total = allEvents.length;
    const paginatedEvents = allEvents.slice(skip, skip + limit);

    const responseData = {
      events: paginatedEvents,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      personalized: true,
      matchedCount: matchedEvents.length,
    };

    // Cache for 60 seconds (per user)
    await cacheSet(cacheKey, responseData, 60);

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
