import {
  WebhookCheckoutCompletedType,
  WebhookPaymentIntentSucceededType,
} from "@/schema/payment.schema";

// convert checkout session customer into order customer
export const formatCheckoutSessionToOrder = (
  session: WebhookCheckoutCompletedType
) => {
  const customer = {
    address: {
      city: session.customer_details.address.city,
      country: session.customer_details.address.country,
      line1: session.customer_details.address.line1,
      line2: session.customer_details.address.line2,
      postal_code: session.customer_details.address.postal_code,
      state: session.customer_details.address.state,
    },
    email: session.customer_details.email,
    name: session.customer_details.name,
    phone: session.customer_details.phone,
    user: session.metadata.userId,
    username: session.metadata.username,
  };

  const paymentInfo = {
    sessionId: session.id,
    paymentIntent: session.payment_intent,
    paymentStatus: session.payment_status === "paid" ? "SUCCESS" : "CANCELLED",
    customer: session.customer,
    restaurant: session.metadata.restaurant,
  };

  return { customer, paymentInfo };
};

// convert payment intent to checkout session
export const formatPaymentIntentToCheckoutSession = (
  paymentIntent: WebhookPaymentIntentSucceededType
) => {
  const session: WebhookCheckoutCompletedType = {
    id: paymentIntent.client_secret,
    amount_total: paymentIntent.amount,
    payment_intent: paymentIntent.id,
    payment_status: paymentIntent.status === "succeeded" ? "paid" : "cancelled",
    customer: paymentIntent.customer,
    created: paymentIntent.created,
    metadata: {
      cartItems: paymentIntent.metadata.cartItems,
      userId: paymentIntent.metadata.userId,
      username: paymentIntent.metadata.username,
      restaurant: paymentIntent.metadata.restaurant,
    },
    customer_details: {
      address: {
        city: paymentIntent.shipping.address.city,
        country: paymentIntent.shipping.address.country,
        line1: paymentIntent.shipping.address.line1,
        line2: paymentIntent.shipping.address.line2,
        postal_code: paymentIntent.shipping.address.postal_code,
        state: paymentIntent.shipping.address.state,
      },
      email: paymentIntent.metadata.email,
      name: paymentIntent.shipping.name,
      phone: paymentIntent.shipping.phone,
    },
    status: paymentIntent.status === "succeeded" ? "complete" : "processing",
  };

  return session;
};
