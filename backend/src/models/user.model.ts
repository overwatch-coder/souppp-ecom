import mongoose, { HydratedDocumentFromSchema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import Code from "@/models/code.model";
import Product from "@/models/product.model";
import Order from "@/models/order.model";
import Restaurant from "@/models/restaurant.model";

enum Role {
  MERCHANT = "MERCHANT",
  USER = "USER",
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    username: {
      type: String,
      required: [true, "Please enter your username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minlength: [8, "Password should be greater than 6 characters"],
      validate: [validator.isStrongPassword, "Please enter a strong password"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: Role.USER,
      enum: [Role.MERCHANT, Role.USER],
    },
    codes: {
      type: [mongoose.Types.ObjectId],
      ref: "Code",
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dmzkknizp/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1704672842/ptm/ptm-photos/xg3z9sq0amlqfqkcn79r.jpg",
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    restaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

mongoose.set("strictPopulate", false);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.post("findOneAndDelete", async function (id, next) {
  const deleteCodes = Code.deleteMany({ userId: id });
  const deleteOrders = Order.deleteMany({ customer: id });
  const deleteProducts = Product.deleteMany({ merchant: id });
  const deleteRestaurants = Restaurant.deleteMany({ merchant: id });
  await Promise.all([
    deleteCodes,
    deleteOrders,
    deleteProducts,
    deleteRestaurants,
  ]);

  next();
});

export type UserType = HydratedDocumentFromSchema<typeof userSchema>;

const User = mongoose.model("User", userSchema);

export default User;
