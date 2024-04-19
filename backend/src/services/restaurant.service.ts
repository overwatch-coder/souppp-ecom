import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";
import {
  CreateRestaurantType,
  UpdateRestaurantType,
} from "@/schema/restaurant.schema";
import Restaurant from "@/models/restaurant.model";
import { UploadedFile } from "express-fileupload";
import { uploadImage } from "@/lib/uploads";
import mongoose, { Types } from "mongoose";
import slugify from "slugify";

export const slugifyOptions = {
  lower: true, // convert to lower case
  trim: true, // remove whitespace
  replacement: "-", // replace spaces with dashes
  remove: /[*+~.()'"!:@]/g, // remove special characters
};

// find restaurant by user and id
export const foundMerchantRestaurant = async (
  id: string,
  userId: Types.ObjectId
) => {
  try {
    // check if id is valid
    if (!mongoose.isValidObjectId(id)) {
      throw createHttpError("Invalid restaurant id", HttpStatusCode.BadRequest);
    }

    // check if restaurant exists
    const restaurantExists = await Restaurant.findOne({ _id: id })
      .lean()
      .exec();

    // check if restaurant exists
    if (!restaurantExists) {
      throw createHttpError("Restaurant not found", HttpStatusCode.NotFound);
    }

    // check if restaurant belongs to user
    if (restaurantExists.merchant.toString() !== userId.toString()) {
      throw createHttpError(
        "You are not authorized to access this restaurant",
        HttpStatusCode.Unauthorized
      );
    }
  } catch (error: any) {
    console.log("found merchant restaurant service error", error);
    throw createHttpError(
      error.message || "An unexpected error has occurred",
      error.statusCode || HttpStatusCode.InternalServerError
    );
  }
};

// check if restaurant name and slug exists
export const restaurantNameAndSlugAlreadyExists = async (
  restaurantName: string
) => {
  try {
    const restaurantNameAndSlugExists = await Restaurant.findOne({
      $or: [
        { name: restaurantName },
        { slug: slugify(restaurantName, slugifyOptions) },
      ],
    });

    if (restaurantNameAndSlugExists) {
      throw createHttpError(
        "Restaurant name and slug already exists. Choose another one",
        HttpStatusCode.BadRequest
      );
    }
  } catch (error: any) {
    console.log("restaurant name and slug already exists service error", error);
    throw createHttpError(
      error.message || "An unexpected error has occurred",
      HttpStatusCode.InternalServerError
    );
  }
};

// add a new restaurant
export const addRestaurant = async (
  userId: string,
  data: CreateRestaurantType,
  coverImageFile: UploadedFile
) => {
  try {
    // upload cover image if it exists
    let coverImage = "";
    if (coverImageFile) {
      coverImage = (await uploadImage(coverImageFile, "restaurants")) as string;
    }

    // create a new restaurant
    const restaurant = await Restaurant.create({
      ...data,
      coverImage,
      merchant: userId,
      slug: slugify(data.name, slugifyOptions),
    });

    if (!restaurant) {
      throw createHttpError("An error occurred while creating the restaurant");
    }

    return restaurant!;
  } catch (error: any) {
    console.log("add restaurant service error", error);
    throw createHttpError(
      error.message || "An error occurred while creating the restaurant",
      HttpStatusCode.InternalServerError
    );
  }
};

// update existing restaurant
export const updateExistingRestaurant = async (
  data: UpdateRestaurantType,
  coverImageFile: UploadedFile,
  id: string
) => {
  try {
    // upload cover image if it exists
    let coverImage = data.coverImage;
    if (coverImageFile) {
      coverImage = (await uploadImage(coverImageFile, "restaurants")) as string;
    }

    let slug = data.slug;
    if (data.name) {
      slug = slugify(data.name, slugifyOptions);
    }

    // update restaurant
    const updatedRestaurant = await Restaurant.findOneAndUpdate(
      { _id: id },
      {
        ...data,
        coverImage,
        slug,
      },
      { new: true }
    )
      .lean()
      .exec();

    if (!updatedRestaurant) {
      throw createHttpError("An error occurred while updating the restaurant");
    }

    return updatedRestaurant!;
  } catch (error: any) {
    console.log("update restaurant service error", error);
    throw createHttpError(
      error.message || "An error occurred while updating the restaurant",
      HttpStatusCode.InternalServerError
    );
  }
};

// get the list of restaurants and products of a merchant
export const getMerchantRestaurantsAndProducts = async (user: string) => {
  try {
    const merchantRestaurantsAndProducts = await Restaurant.find({
      merchant: user,
    })
      .populate("products")
      .lean()
      .exec();

    return merchantRestaurantsAndProducts;
  } catch (error: any) {
    console.log("get restaurant service error", error);
    throw createHttpError(
      error.message || "An error occurred while updating the restaurant",
      HttpStatusCode.InternalServerError
    );
  }
};
