import mongoosePaginate from "mongoose-paginate-v2";
import mongoose, { HydratedDocumentFromSchema } from "mongoose";
import slugify from "slugify";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    zipCode: { type: String },
    description: { type: String, required: true },
    coverImage: { type: String },
    expectedDeliveryTime: { type: String, default: "30" },
    products: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: [] },
    ],
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// set strictPopulate to false
mongoose.set("strictPopulate", false);

// implement pagination using mongoose paginate plugin
restaurantSchema.plugin(mongoosePaginate);

type RestaurantModelType = HydratedDocumentFromSchema<typeof restaurantSchema>;

// export the restaurant model
const Restaurant = mongoose.model<
  RestaurantModelType,
  mongoose.PaginateModel<RestaurantModelType>
>("Restaurant", restaurantSchema, "restaurants");

export default Restaurant;
