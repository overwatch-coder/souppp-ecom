import mongoose, { HydratedDocumentFromSchema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    coverImage: {
      type: String,
      required: true,
      default:
        "https://res.cloudinary.com/dmzkknizp/image/upload/v1678171055/cld-sample-4.jpg",
    },
    images: { type: [String] },
    category: { type: String, default: "Others" },
    countInStock: { type: Number, required: true },
    reviews: { type: [String] },
    rating: { type: Number },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

mongoose.set("strictPopulate", false);

productSchema.plugin(mongoosePaginate);

productSchema.pre("save", async function (next) {
  // Only generate slug if name is modified or the document is new
  if (!this.isModified("name")) {
    next();
  }

  // Generate slug from name using slugify
  this.slug = slugify(this.name, { lower: true, trim: true });

  next();
});

export type ProductType = HydratedDocumentFromSchema<typeof productSchema>;

const Product = mongoose.model<
  ProductType,
  mongoose.PaginateModel<ProductType>
>("Product", productSchema, "products");

export default Product;
