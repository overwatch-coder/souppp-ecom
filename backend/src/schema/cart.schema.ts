import { z } from "zod";

export const cartSchema = z.object({
  cart: z.array(
    z.object({
      _id: z.string({ required_error: "Product ID is required" }),
      price: z.coerce.number({ required_error: "Price is required" }),
      description: z.string().default('"Product description"'),
      coverImage: z
        .string()
        .default(
          "https://res.cloudinary.com/dmzkknizp/image/upload/v1678171055/cld-sample-4.jpg"
        ),
      images: z.array(z.string()).default([]),
      category: z.string().default("Others"),
      countInStock: z.coerce.number({ required_error: "Quantity is required" }),
      rating: z.coerce.number().default(0),
      merchant: z.string({ required_error: "Merchant ID is required" }),
      name: z.string({ required_error: "Name is required" }),
      slug: z.string(),
      quantity: z.coerce.number().default(1),
    })
  ),
  restaurant: z.string({ required_error: "Restaurant ID is required" }),
});

export type CartType = z.infer<typeof cartSchema>;
