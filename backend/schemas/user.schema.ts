import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string({ message: "Name is required" }),
  profileImage: z.string().optional(),
  email: z.string({ message: "Email is required" }).email("Invalid email"),
  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "organizer", "admin"]).optional(),
  isPremium: z.boolean().optional(),
  interests: z.array(z.string()).optional(),
  location: z
    .object({
      city: z.string(),
      lat: z.number(),
      lng: z.number(),
    })
    .optional(),
});

export const loginUserSchema = z.object({
  email: z.string({ message: "Email is required" }).email("Invalid email"),
  password: z.string({ message: "Password is required" }),
});
