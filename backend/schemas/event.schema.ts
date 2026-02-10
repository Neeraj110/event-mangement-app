import { z } from "zod";

export const createEventSchema = z.object({
  body: z.object({
    title: z.string({ message: "Title is required" }),
    coverImage: z.string().optional(),
    description: z.string({ message: "Description is required" }),
    category: z.string({ message: "Category is required" }),
    location: z.object({
      city: z.string({ message: "City is required" }),
      lat: z.coerce.number({ message: "Latitude is required" }),
      lng: z.coerce.number({ message: "Longitude is required" }),
    }),
    startDate: z.coerce.date({ message: "Start Date is required" }),
    endDate: z.coerce.date({ message: "End Date is required" }),
    price: z.coerce.number({ message: "Price is required" }).min(0),
    capacity: z.coerce.number({ message: "Capacity is required" }).min(1),
    isPublished: z.coerce.boolean().optional(),
  }),
});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    location: z
      .object({
        city: z.string().optional(),
        lat: z.coerce.number().optional(),
        lng: z.coerce.number().optional(),
      })
      .optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    price: z.coerce.number().min(0).optional(),
    capacity: z.coerce.number().min(1).optional(),
    isPublished: z.coerce.boolean().optional(),
  }),
});
