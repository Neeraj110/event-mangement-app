import { z } from "zod";

export const createCheckInSchema = z.object({
  body: z.object({
    eventId: z.string({ message: "Event ID is required" }),
    ticketId: z.string({ message: "Ticket ID is required" }),
    scannedBy: z.string({ message: "Scanner User ID is required" }),
  }),
});
