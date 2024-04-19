import mongoose, { HydratedDocumentFromSchema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const AddressSchema = new mongoose.Schema({
  city: { type: String, required: true },
  country: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String, default: null },
  postal_code: { type: String, default: null },
  state: { type: String, default: null },
});

const CustomerDetailsSchema = new mongoose.Schema({
  address: { type: AddressSchema, required: true },
  email: { type: String, required: true },
  name: { type: String },
  phone: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: { type: String },
});

export enum PaymentStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
}

export enum PaymentByCheckoutSessionOrPaymentIntent {
  CHECKOUT_SESSION = "checkout_session",
  PAYMENT_INTENT = "payment_intent",
}

const orderSchema = new mongoose.Schema(
  {
    totalAmount: { type: Number, required: true },
    orderedDate: {
      type: Date,
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
      },
    ],
    customer: { type: CustomerDetailsSchema, required: true },
    paymentInfo: {
      sessionId: { type: String, required: true },
      paymentIntent: { type: String, required: true },
      paymentStatus: { type: String, default: PaymentStatus.SUCCESS },
      customer: { type: String, required: true },
      restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    },
    orderStatus: { type: String, default: OrderStatus.PENDING },
    expectedDeliveryTime: { type: String },
    paymentBy: {
      type: String,
      default: PaymentByCheckoutSessionOrPaymentIntent.CHECKOUT_SESSION,
    },
  },
  { timestamps: true, versionKey: false }
);

mongoose.set("strictPopulate", false);

orderSchema.plugin(mongoosePaginate);

export type OrderType = HydratedDocumentFromSchema<typeof orderSchema>;

const Order = mongoose.model<OrderType, mongoose.PaginateModel<OrderType>>(
  "Order",
  orderSchema,
  "orders"
);

export default Order;
