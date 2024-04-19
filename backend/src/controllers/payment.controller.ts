import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import stripe from "@/config/stripe";
import { CartType } from "@/schema/cart.schema";
import {
  createPaymentIntent,
  createStipeCustomer,
  createStripeSession,
} from "@/services/payment.service";
import {
  webhookCheckoutCompletedSchema,
  webhookPaymentIntentSucceededSchema,
} from "@/schema/payment.schema";
import { createCompletedOrder } from "@/services/order.service";
import { formatPaymentIntentToCheckoutSession } from "@/lib/formatPayment";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";

/**
  @desc    CREATE A STRIPE CHECKOUT SESSION
  @route   /api/payment/stripe-checkout
  @access  private
*/
export const createStripeCheckout = asyncHandler(
  async (req: Request<any, any, CartType>, res: Response) => {
    const user = req.user;
    const cartItems = req.body.cart;
    const restaurant = req.body.restaurant;

    if (user.role !== "USER") {
      throw createHttpError(
        "Not allowed. Only customers can order food items.",
        HttpStatusCode.BadRequest
      );
    }

    if (cartItems?.length === 0) {
      throw createHttpError("Cart cannot be empty", HttpStatusCode.BadRequest);
    }
    const customer = await createStipeCustomer(user);

    // get product images
    let productImages: string[] = [];
    cartItems.map((item) => {
      if (item.coverImage) {
        productImages.push(item.coverImage);
      }

      if (item.images) {
        item.images.map((image) => productImages.push(image));
      }
    });

    const session = await createStripeSession(
      customer!,
      { cart: cartItems, restaurant },
      user,
      productImages
    );

    res.status(200).json({
      success: true,
      data: { url: session!.url, sessionId: session!.id },
      message: "Checkout session created successfully",
    });
  }
);

/**
  @desc    CREATE A STRIPE PAYMENT INTENT
  @route   /api/payment/stripe-payment-intent
  @access  private
*/
export const createStripePaymentIntent = asyncHandler(
  async (req: Request<any, any, CartType>, res: Response) => {
    const user = req.user;
    const cartItems = req.body.cart;
    const restaurant = req.body.restaurant;

    if (user.role !== "USER") {
      throw createHttpError(
        "Not allowed. Only customers can order food items.",
        HttpStatusCode.Unauthorized
      );
    }

    if (cartItems?.length === 0) {
      throw createHttpError("Cart cannot be empty", HttpStatusCode.BadRequest);
    }

    const customer = await createStipeCustomer(user);

    // get total price
    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const paymentIntent = await createPaymentIntent(
      user,
      customer!,
      { cart: cartItems, restaurant },
      totalPrice
    );

    res.status(200).json({
      success: true,
      data: {
        id: paymentIntent!.id,
        clientSecret: paymentIntent!.client_secret,
      },
      message: "Payment intent created successfully",
    });
  }
);

/**
  @desc    HANDLE STRIPE WEBHOOK
  @route   /api/payment/stripe-webhook
  @access  public
*/
export const stripeWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const sig = req.headers["stripe-signature"]!;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.log(`Webhook Error: ${err.message}`);
      throw createHttpError(
        "Could not verify the signature of the checkout session event",
        HttpStatusCode.Unauthorized
      );
    }

    switch (event?.type) {
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        const validatedCheckoutSession =
          webhookCheckoutCompletedSchema.safeParse(checkoutSessionCompleted);

        if (!validatedCheckoutSession.success) {
          console.log(
            `Webhook Error: ${validatedCheckoutSession.error.errors.map(
              (err) => err.message
            )}`
          );
          throw createHttpError("Could not verify the checkout session event");
        }

        const createdOrderFromCheckout = await createCompletedOrder(
          validatedCheckoutSession.data
        );

        console.log(`Order created: ${createdOrderFromCheckout}`);
        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        const validatedPaymentIntent =
          webhookPaymentIntentSucceededSchema.safeParse(paymentIntentSucceeded);

        if (!validatedPaymentIntent.success) {
          console.log(
            `Webhook Error: ${validatedPaymentIntent.error.errors.map(
              (err) => err.message
            )}`
          );
          throw createHttpError("Could not verify the payment intent event");
        }

        const formattedPaymentIntentData = formatPaymentIntentToCheckoutSession(
          validatedPaymentIntent.data
        );

        const createdOrderFromPaymentIntent = await createCompletedOrder(
          formattedPaymentIntentData
        );

        console.log(`Order created: ${createdOrderFromPaymentIntent}`);
        break;
      default:
        console.log("Unhandled checkout session webhook event type");
        break;
    }

    // Return a 200 response to acknowledge receipt of the event
    res.sendStatus(200);
  }
);
