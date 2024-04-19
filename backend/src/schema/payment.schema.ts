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
});

// create stripe checkout session schema
export const webhookCheckoutCompletedSchema = z.object({
  id: z.string(),
  amount_total: z.coerce.number().transform((value) => value / 100),
  created: z
    .number()
    .transform((value) => new Date(value * 1000).toISOString()),
  customer: z.string(),
  customer_details: CustomerDetailsSchema,
  metadata: z.object({
    cartItems: z.string().transform((value) => JSON.parse(value)),
    userId: z.string(),
    username: z.string(),
    restaurant: z.string(),
  }),
  payment_intent: z.string(),
  payment_status: z.string(),
  status: z.string(),
});

// create stripe payment intent schema
export const webhookPaymentIntentSucceededSchema = z.object({
  id: z.string(),
  amount: z.coerce.number().transform((value) => value / 100),
  client_secret: z.string(),
  created: z
    .number()
    .transform((value) => new Date(value * 1000).toISOString()),
  customer: z.string(),
  metadata: z.object({
    cartItems: z.string().transform((value) => JSON.parse(value)),
    userId: z.string(),
    username: z.string(),
    email: z.string(),
    restaurant: z.string(),
  }),
  shipping: CustomerDetailsSchema.omit({ email: true }),
  status: z.string(),
});

export type WebhookCheckoutCompletedType = z.infer<
  typeof webhookCheckoutCompletedSchema
>;

export type WebhookPaymentIntentSucceededType = z.infer<
  typeof webhookPaymentIntentSucceededSchema
>;

export type CreateCompletedOrderType = z.infer<
  typeof webhookCheckoutCompletedSchema
>;
