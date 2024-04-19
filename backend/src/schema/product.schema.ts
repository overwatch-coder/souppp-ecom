import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least 3 characters long" }),
  price: z.coerce.string({ required_error: "Price is required" }).default("0"),
  description: z
    .string({ required_error: "Description is required" })
    .trim()
    .min(10, { message: "Description must be at least 10 characters long" }),
  slug: z.string({ required_error: "Slug is required" }).trim().optional(),
  countInStock: z
    .string({ required_error: "Quantity left/available is a required" })
    .trim(),
  coverImage: z
    .string({ required_error: "Cover Photo is required" })
    .trim()
    .default(
      "https://res.cloudinary.com/dmzkknizp/image/upload/v1678171055/cld-sample-4.jpg"
    )
    .optional(),
  images: z.array(z.string()).default([]),
  category: z
    .string({ required_error: "Category is required" })
    .trim()
    .default("Others")
    .optional(),
  reviews: z.string().optional().or(z.array(z.string()).optional()),
  rating: z.string().trim().optional(),
  restaurant: z.string({ required_error: "Restaurant Id is required" }).trim(),
  merchant: z
    .string({ required_error: "Merchant Id is required" })
    .trim()
    .optional(),
  _id: z.string().trim().optional(),
  createdAt: z.string().trim().optional(),
  updatedAt: z.string().trim().optional(),
});

export const createProductSchema = productSchema
  .omit({
    _id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    coverImageFile: z.any({ required_error: "Cover Image is required" }),
    imagesFile: z.any().optional(),
  });

const updateProductSchema = productSchema.partial().extend({
  coverImageFile: z.any().optional(),
  imagesFile: z.any().optional(),
});

export type CreateProductType = z.infer<typeof createProductSchema>;
export type UpdateProductType = z.infer<typeof updateProductSchema>;
