import { slugifyOptions } from "@/services/restaurant.service";
import slugify from "slugify";
import { z } from "zod";

export const restaurantSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(5, { message: "Name must be at least 5 characters long" }),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" }),
  phone: z.coerce
    .string({ required_error: "Phone number is required" })
    .refine((value) => value.length >= 10 && value.length <= 15, {
      message: "Phone number must be between 10 and 15 characters long",
    }),
  address: z.string({ required_error: "Address is required" }).trim(),
  city: z.string({ required_error: "City is required" }).trim(),
  country: z.string({ required_error: "Country is required" }).trim(),
  state: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  description: z.string({ required_error: "Description is required" }).trim(),
  coverImage: z.string().trim().optional(),
  expectedDeliveryTime: z
    .string({ required_error: "Expected Delivery Time is required" })
    .trim(),
  products: z.string().array().default([]).optional(),
  merchant: z.string({ required_error: "Merchant is required" }).trim(),
  verified: z.coerce.boolean().default(false),
  rating: z.coerce.number().default(0),
  slug: z
    .string()
    .trim()
    .optional()
    .refine((value) => {
      if (!value) return true;
      return slugify(value, slugifyOptions);
    }),
  _id: z.string().optional(),
  createdAt: z.string().optional(),
});

export const createRestaurantSchema = restaurantSchema.omit({
  _id: true,
  createdAt: true,
  slug: true,
  products: true,
  coverImage: true,
  merchant: true,
});

export const updateRestaurantSchema = restaurantSchema.partial();

// generate types
export type RestaurantType = z.infer<typeof restaurantSchema>;
export type CreateRestaurantType = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantType = z.infer<typeof updateRestaurantSchema>;
