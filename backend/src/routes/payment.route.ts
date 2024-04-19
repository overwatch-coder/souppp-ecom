import {
  stripeWebhook,
  createStripeCheckout,
  createStripePaymentIntent,
} from "@/controllers/payment.controller";
import { isUserProtected } from "@/middleware/auth.middleware";
import { validateRequest } from "@/middleware/validateRequest.middleware";
import { cartSchema } from "@/schema/cart.schema";
import express from "express";

const router = express.Router();

// stripe checkout session
router.post(
  "/stripe-checkout",
  isUserProtected,
  validateRequest(cartSchema),
  createStripeCheckout
);

// stripe create payment intent
router.post(
  "/stripe-payment-intent",
  isUserProtected,
  validateRequest(cartSchema),
  createStripePaymentIntent
);

// stripe webhook
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
