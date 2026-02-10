import { z } from "zod";

export const createAnalyticsEventSchema = z.object({
  body: z.object({
    eventId: z.string({ message: "Event ID is required" }),
    type: z.enum(["view", "click", "checkin"]),
    userId: z.string().optional(),
  }),
});
