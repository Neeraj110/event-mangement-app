import { z } from "zod";

export const createTicketSchema = z.object({
  body: z.object({
    eventId: z.string({ message: "Event ID is required" }),
    userId: z.string({ message: "User ID is required" }),
    ticketCode: z.string({ message: "Ticket Code is required" }),
    qrPayload: z.string({ message: "QR Payload is required" }),
    status: z.enum(["valid", "used", "cancelled"]).optional(),
  }),
});
