import { z } from "zod";

const AddressSchema = z.object({
  city: z.string(),
  country: z.string(),
  line1: z.string(),
  line2: z.string().nullable(),
  postal_code: z.string(),
  state: z.string().nullable(),
});

const CustomerDetailsSchema = z.object({
  address: AddressSchema,
  email: z.string(),
  name: z.string(),
  phone: z.string(),
  userId: z.string(),
  username: z.string(),
});

const PaymentStatus = z.enum(["SUCCESS", "FAILED", "CANCELLED", "PENDING"]);

const OrderStatus = z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"]);

export const orderSchema = z.object({
  totalAmount: z.number().refine((value) => value / 100),
  expectedDeliveryTime: z.string().optional(),
  orderedDate: z
    .number()
    .refine((value) => new Date(value * 1000).toISOString()),
  items: z.array(
    z.object({
      product: z.string(),
      quantity: z.number(),
    })
  ),
  customer: CustomerDetailsSchema,
  paymentInfo: z.object({
    sessionId: z.string(),
    paymentIntent: z.string(),
    paymentStatus: PaymentStatus.default("PENDING"),
    restaurant: z.string({ required_error: "Restaurant ID is required" }),
  }),
  orderStatus: OrderStatus.default("PENDING"),
  _id: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  paymentBy: z.string().default("checkout_session").optional(),
});

export const updateOrderSchema = z.object({
  orderStatus: OrderStatus.default("PROCESSING"),
  restaurant: z.string({ required_error: "Restaurant ID is required" }),
});

export type AddressTYpe = z.infer<typeof AddressSchema>;
export type CustomerDetailsType = z.infer<typeof CustomerDetailsSchema>;
export type CreateOrderType = z.infer<typeof orderSchema>;
export type UpdateOrderType = z.infer<typeof updateOrderSchema>;
