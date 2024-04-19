import { uploadImage, uploadMultipleImages } from "@/lib/uploads";
import Product from "@/models/product.model";
import User from "@/models/user.model";
import { CreateProductType, UpdateProductType } from "@/schema/product.schema";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";
import Restaurant from "@/models/restaurant.model";
import slugify from "slugify";
import { slugifyOptions } from "@/services/restaurant.service";

// create a product and store in database
export const addProduct = async (userId: string, data: CreateProductType) => {
  try {
    const images =
      data.imagesFile !== undefined
        ? await uploadMultipleImages(data.imagesFile, "products")
        : [];

    const coverImage = await uploadImage(data.coverImageFile, "products");

    const product = await Product.create({
      ...data,
      images,
      coverImage,
      merchant: userId,
    });

    if (!product) {
      throw createHttpError("An error occurred while creating the product");
    }

    await User.findOneAndUpdate(
      { _id: product.merchant },
      { $push: { products: product._id } },
      { new: true }
    );

    await Restaurant.findOneAndUpdate(
      { _id: product.restaurant },
      { $push: { products: product._id } },
      { new: true }
    );

    return product;
  } catch (error: any) {
    console.log(error);
    throw createHttpError(
      "An error occurred while creating the product",
      HttpStatusCode.InternalServerError
    );
  }
};

// update an existing product
export const updateExistingProduct = async (
  userId: string,
  id: string,
  data: UpdateProductType
) => {
  try {
    const product = await Product.findOne({
      $and: [{ _id: id }, { merchant: userId }],
    });
    if (!product) {
      throw createHttpError("Product not found", HttpStatusCode.NotFound);
    }

    // upload images if they are changed
    const coverImage = data.coverImageFile
      ? await uploadImage(data.coverImageFile, "products")
      : product!.coverImage;

    const images = data.imagesFile
      ? await uploadMultipleImages(data.imagesFile, "products")
      : product!.images;

    const updatedProduct = await Product.findOneAndUpdate(
      { $and: [{ _id: id }, { merchant: userId }] },
      {
        ...data,
        coverImage,
        images,
        slug: data?.name ? slugify(data.name, slugifyOptions) : product.slug,
      },
      { new: true }
    ).populate("users");

    if (!updatedProduct) {
      throw createHttpError(
        "An error occurred while updating the product",
        HttpStatusCode.InternalServerError
      );
    }

    return updatedProduct;
  } catch (error: any) {
    throw createHttpError(error.message, HttpStatusCode.InternalServerError);
  }
};

// remove product from database service
export const removeProduct = async (userId: string, id: string) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({
      $and: [{ _id: id }, { merchant: userId }],
    });

    if (!deletedProduct) {
      throw createHttpError(
        `An error occurred while deleting the product`,
        HttpStatusCode.InternalServerError
      );
    }
  } catch (error: any) {
    throw createHttpError(error.message, HttpStatusCode.InternalServerError);
  }
};

// add product to favorite
export const addProductToUserFavorites = async (userId: string, id: string) => {
  try {
    const updated = await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { favorites: id } },
      { new: true }
    )
      .select("-password")
      .populate("favorites")
      .populate("orders");

    if (!updated) {
      throw createHttpError(
        "An error occurred while adding the product to favorites",
        HttpStatusCode.InternalServerError
      );
    }

    return updated;
  } catch (error: any) {
    throw createHttpError(error.message, HttpStatusCode.InternalServerError);
  }
};

// remove product from favorite
export const removeProductFromUserFavorites = async (
  userId: string,
  id: string
) => {
  try {
    const updated = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { favorites: id } },
      { new: true }
    )
      .select("-password")
      .populate("favorites")
      .populate("orders");

    if (!updated) {
      throw createHttpError(
        "An error occurred while removing the product from favorites",
        HttpStatusCode.InternalServerError
      );
    }

    return updated;
  } catch (error: any) {
    throw createHttpError(error.message, HttpStatusCode.InternalServerError);
  }
};
