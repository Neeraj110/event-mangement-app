import { z } from "zod";

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be at most 100 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description must be at most 2000 characters"),
    category: z.string().min(1, "Please select a category"),
    city: z.string().min(1, "City is required"),
    lat: z.coerce.number({ invalid_type_error: "Latitude must be a number" }),
    lng: z.coerce.number({ invalid_type_error: "Longitude must be a number" }),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    price: z.coerce
      .number({ invalid_type_error: "Price must be a number" })
      .min(0, "Price cannot be negative"),
    capacity: z.coerce
      .number({ invalid_type_error: "Capacity must be a number" })
      .min(1, "Capacity must be at least 1"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const EVENT_CATEGORIES = [
  "Music",
  "Tech",
  "Sports",
  "Art",
  "Food",
  "Business",
  "Health",
  "Education",
  "Other",
] as const;