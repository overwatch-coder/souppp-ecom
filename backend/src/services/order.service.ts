import { formatCheckoutSessionToOrder } from "@/lib/formatPayment";
import Order, {
  OrderType,
  PaymentByCheckoutSessionOrPaymentIntent,
} from "@/models/order.model";
import User, { UserType } from "@/models/user.model";
import { WebhookCheckoutCompletedType } from "@/schema/payment.schema";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";
import Product from "@/models/product.model";
import {
  getOrderConfirmationEmailContent,
  getOrderDeliveryEmailContent,
  getOrderShippedEmailContent,
  getOrderStatusChangeEmailContent,
} from "@/constants/email";
import { sendConfirmationEmail } from "@/lib";
import Restaurant from "@/models/restaurant.model";
import { UpdateOrderType } from "@/schema/order.schema";
import {
  getExpectedDeliveryTime,
  getExpectedDeliveryDate,
} from "@/lib/formatDate";

export type OrderedProducts = {
  name: string;
  price: number;
  quantity: number;
  coverImage: string;
};

// create a new order in the databse based on the webhook data from stripe
export const createCompletedOrder = async (
  session: WebhookCheckoutCompletedType
) => {
  try {
    const { customer, paymentInfo } = formatCheckoutSessionToOrder(session);
    const restaurant = await Restaurant.findOne({ _id: paymentInfo.restaurant })
      .lean()
      .exec();

    const deliveryTime = getExpectedDeliveryTime(
      restaurant?.expectedDeliveryTime!,
      session.created
    );

    const order = await Order.create({
      totalAmount: session.amount_total,
      orderedDate: session.created,
      items: session.metadata.cartItems,
      expectedDeliveryTime: deliveryTime,
      customer,
      paymentInfo,
      orderStatus: "PENDING",
      paymentBy: session.id.startsWith("cs_")
        ? PaymentByCheckoutSessionOrPaymentIntent.CHECKOUT_SESSION
        : PaymentByCheckoutSessionOrPaymentIntent.PAYMENT_INTENT,
    });

    if (!order) {
      throw createHttpError(
        "An error occurred while creating the order. Try again later.",
        HttpStatusCode.InternalServerError
      );
    }

    await User.findOneAndUpdate(
      { _id: order.customer.user },
      { $push: { orders: order._id } },
      { new: true }
    );

    // send confirmation email
    const content = getOrderConfirmationEmailContent(
      order._id.toString(),
      order.totalAmount,
      order.customer.username!
    );

    await sendConfirmationEmail(
      order.customer.email,
      order.customer.username!,
      "Order Confirmation",
      content
    );

    return order;
  } catch (err: any) {
    console.log("creating session error:", err);
    throw createHttpError(
      err.message || "An error occurred while checking out. Try again later.",
      err.statusCode || HttpStatusCode.InternalServerError
    );
  }
};

// get products from an order
export const getProductsFromOrders = async (order: OrderType) => {
  // find the actual products contained in the order
  const orderedProductsPromises = order.items.map(async (item) => {
    const product = await Product.findOne({ _id: item.product })
      .select("name price")
      .lean()
      .exec();

    const orderDetails: OrderedProducts = {
      name: product?.name!,
      price: product?.price! * item.quantity,
      quantity: item.quantity,
      coverImage: product?.coverImage!,
    };

    return orderDetails;
  });

  const orderedProducts = await Promise.all(orderedProductsPromises);

  return orderedProducts;
};

// update order status
export const updateOrderService = async (
  user: UserType,
  data: UpdateOrderType,
  id: string
) => {
  try {
    // get the restaurant data from the current user
    const restaurantOwner = await Restaurant.findOne({ merchant: user._id })
      .lean()
      .exec();

    if (!restaurantOwner) {
      throw createHttpError(
        "You currently do not have a restaurant. Please create one.",
        HttpStatusCode.Unauthorized
      );
    }

    // check if the restaurant owner is updating the order
    if (data.restaurant !== restaurantOwner._id.toString()) {
      throw createHttpError(
        "You are not authorized to update this order",
        HttpStatusCode.Unauthorized
      );
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id },
      { orderStatus: data.orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      throw createHttpError(
        "An error occurred while updating the order. Try again later.",
        HttpStatusCode.InternalServerError
      );
    }

    // send order status change email to the customer
    let emailContent = "";
    let trackingNumber = "ABC123456789";
    let deliveryCity = updatedOrder.customer.address.city;
    let carrier = "Name: Abdul Rashid | Tel: +1234567890";
    let deliveryAddress = `${updatedOrder.customer.address.line1}, ${updatedOrder.customer.address.city} ${updatedOrder.customer.address.postal_code}`;
    let emailSubject = "";

    switch (updatedOrder.orderStatus as UpdateOrderType["orderStatus"]) {
      case "PROCESSING":
        emailSubject = "Order Status Change";
        emailContent = getOrderStatusChangeEmailContent(
          updatedOrder._id.toString(),
          user.name,
          updatedOrder.orderStatus
        );
        break;
      case "SHIPPED":
        emailSubject = "Order Shipped Notification";
        emailContent = getOrderShippedEmailContent(
          updatedOrder._id.toString(),
          user.name,
          trackingNumber,
          carrier,
          getExpectedDeliveryDate(),
          deliveryCity
        );
        break;
      case "DELIVERED":
        emailSubject = "Order Out for Delivery";
        emailContent = getOrderDeliveryEmailContent(
          updatedOrder._id.toString(),
          user.name,
          trackingNumber,
          carrier,
          updatedOrder.expectedDeliveryTime!,
          deliveryAddress
        );
        break;
      default:
        emailSubject = "Order Status Change";
        emailContent = getOrderConfirmationEmailContent(
          updatedOrder._id.toString(),
          updatedOrder.totalAmount,
          user.name
        );
        break;
    }

    await sendConfirmationEmail(
      updatedOrder.customer.email,
      updatedOrder.customer.username!,
      emailSubject,
      emailContent
    );

    return updatedOrder;
  } catch (err: any) {
    console.log("updating order error:", err);
    throw createHttpError(
      err.message ||
        "An error occurred while updating the order. Try again later.",
      err.statusCode || HttpStatusCode.InternalServerError
    );
  }
};

// get orders based on the type of restaurant
export const getOrdersByRestaurant = async (restaurantId: string) => {
  try {
    const orders = await Order.find({ "paymentInfo.restaurant": restaurantId })
      .select("-__v")
      .sort({ createdAt: -1 })
      .populate("items.product")
      .lean()
      .exec();

    return orders;
  } catch (err: any) {
    console.log("get orders from restaurant", err);
    throw createHttpError(
      err.message ||
        "An error occurred while getting the orders. Try again later.",
      err.statusCode || HttpStatusCode.InternalServerError
    );
  }
};
