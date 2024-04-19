import stripe from "@/config/stripe";
import { UserType } from "@/models/user.model";
import { CartType } from "@/schema/cart.schema";
import Stripe from "stripe";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";

// create a customer
export const createStipeCustomer = async (user: UserType) => {
  try {
    // check if customer already exists
    const stripeCustomerExists = await stripe.customers.list({
      email: user.email,
    });

    if (stripeCustomerExists.data.length === 0) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString(),
          role: user.role,
          image: user.image,
        },
      });

      return customer as Stripe.Customer;
    }

    const customerPromise = stripeCustomerExists.data.map(
      async (stripeCustomer) => {
        if (stripeCustomer.email === user.email) {
          return stripeCustomer;
        }

        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: {
            userId: user._id.toString(),
            role: user.role,
            image: user.image,
          },
        });

        return customer!;
      }
    );

    const customer = await Promise.all(customerPromise);

    // check if customer exists
    if (!customer[0]) {
      throw createHttpError(
        "An error occurred while checking out. Try again later.",
        HttpStatusCode.InternalServerError
      );
    }

    return customer[0] as Stripe.Customer;
  } catch (err: any) {
    console.log("creating session error:", err);
    throw createHttpError(
      err.message || "An error occurred while checking out. Try again later.",
      err.statusCode || HttpStatusCode.InternalServerError
    );
  }
};

// create stripe checkout session
export const createStripeSession = async (
  customer: Stripe.Customer,
  { cart: cartItems, restaurant }: CartType,
  user: UserType,
  productImages: string[]
) => {
  try {
    const session = await stripe.checkout.sessions.create(
      {
        client_reference_id: user._id.toString(),
        customer: customer.id,
        line_items: cartItems.map(({ quantity, ...product }) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              images: productImages,
              description: product.description,
              metadata: {
                id: product._id,
                slug: product.slug!,
                category: product.category!,
                merchant: product.merchant!,
                rating: product.rating,
              },
            },
            unit_amount: parseInt(product.price.toFixed(2)) * 100,
          },
          quantity: quantity,
        })),
        metadata: {
          cartItems: JSON.stringify(
            cartItems.map(({ quantity, ...product }) => ({
              product: product._id,
              quantity,
              restaurant,
            }))
          ),
          userId: user._id.toString(),
          username: user.username,
          restaurant,
        },
        phone_number_collection: {
          enabled: true,
        },
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "required",
        success_url: `${process.env.FRONTEND_URL}/status/order-status?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/status/cart`,
      },
      {
        idempotencyKey: crypto.randomUUID(),
      }
    );

    return session;
  } catch (err: any) {
    console.log("creating stripe session error:", err);
    throw createHttpError(
      "An error occurred while checking out. Try again later.",
      HttpStatusCode.InternalServerError
    );
  }
};

// create payment intent
export const createPaymentIntent = async (
  user: UserType,
  customer: Stripe.Customer,
  { cart: cartItems, restaurant }: CartType,
  total: number
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(total.toFixed(2)) * 100,
      currency: "usd",
      customer: customer.id,
      metadata: {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        restaurant,
        cartItems: JSON.stringify(
          cartItems.map(({ quantity, ...item }) => ({
            product: item._id,
            quantity,
            restaurant,
          }))
        ),
      },
    });

    return paymentIntent;
  } catch (err: any) {
    console.log("creating payment intent error:", err);
    throw createHttpError(
      "An error occurred while checking out. Try again later.",
      HttpStatusCode.InternalServerError
    );
  }
};
