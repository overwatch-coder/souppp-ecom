import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import {
  CreateRestaurantType,
  UpdateRestaurantType,
} from "@/schema/restaurant.schema";
import Restaurant from "@/models/restaurant.model";
import { UploadedFile } from "express-fileupload";
import slugify from "slugify";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";
import { SortOrder } from "mongoose";
import {
  addRestaurant,
  foundMerchantRestaurant,
  restaurantNameAndSlugAlreadyExists,
  updateExistingRestaurant,
} from "@/services/restaurant.service";

/**
  @desc    GET ALL RESTAURANTS
  @route   /api/restaurants
  @access  public
*/
export const getAllRestaurants = asyncHandler(
  async (
    req: Request<
      any,
      any,
      any,
      { limit?: string; page?: string; sortBy?: string; search?: string }
    >,
    res: Response
  ) => {
    // url = /api/restaurants?sortBy=name:desc&search=kfc&limit=10&page=2
    const limit = parseInt(req.query.limit as string) || 20;
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string;

    // get sort key and value from sortBy
    let sortKey = "createdAt";
    let sortValue: SortOrder = "desc";
    if (sortBy) {
      sortKey = sortBy.split(":")[0];
      sortValue = sortBy.split(":")[1] as SortOrder;
    }

    const restaurants = await Restaurant.paginate(
      search ? { name: { $regex: search, $options: "i" } } : {},
      {
        limit,
        page,
        sort: { [sortKey]: sortValue },
        populate: [
          {
            path: "products",
            populate: { path: "merchant", select: "name username image _id" },
            options: { sort: { createdAt: -1 }, lean: true },
          },
        ],
      }
    );

    // check if there are no restaurants
    if (restaurants.totalDocs === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: "You do not have any restaurants yet",
      });
    }

    res.status(200).json({
      success: true,
      data: restaurants,
      message: "All restaurants",
    });
  }
);

/**
  @desc    GET A SINGLE RESTAURANT
  @route   /api/restaurants/:id
  @access  public
*/
export const getSingleRestaurant = asyncHandler(
  async (req: Request<{ id: string }, any, any>, res: Response) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findOne({ _id: id })
      .populate({
        path: "products",
        populate: { path: "merchant", select: "name username image _id" },
        options: { sort: { createdAt: -1 }, lean: true },
      })
      .populate({ path: "merchant", select: "_id name username image" })
      .select("-__v")
      .lean()
      .exec();

    if (!restaurant) {
      throw createHttpError("Restaurant not found", HttpStatusCode.NotFound);
    }

    res.status(200).json({
      success: true,
      data: restaurant,
      message: `Single restaurant retrieved successfully`,
    });
  }
);

/**
  @desc    CREATE AN RESTAURANT
  @route   /api/restaurants
  @access  private
*/
export const createRestaurant = asyncHandler(
  async (req: Request<any, any, CreateRestaurantType>, res: Response) => {
    const user = req.user;
    const restaurantData = req.body;
    const coverImageFile = req.files?.coverImage as UploadedFile;

    await restaurantNameAndSlugAlreadyExists(restaurantData.name);

    const createdRestaurant = await addRestaurant(
      user._id.toString(),
      restaurantData,
      coverImageFile
    );

    res.status(201).json({
      success: true,
      data: createdRestaurant,
      message: `Restaurant created successfully`,
    });
  }
);

/**
  @desc    UPDATE AN EXISTING RESTAURANT
  @route   /api/restaurants/:id
  @access  private
*/
export const updateRestaurant = asyncHandler(
  async (
    req: Request<{ id: string }, any, UpdateRestaurantType>,
    res: Response
  ) => {
    const user = req.user;
    const { id } = req.params;
    const coverImageFile = req.files?.coverImage as UploadedFile;
    const restaurantData = req.body;

    // check if restaurant exists
    await foundMerchantRestaurant(id, user._id);

    // check if restaurant name and slug exists
    if (restaurantData.name) {
      await restaurantNameAndSlugAlreadyExists(restaurantData.name);
    }

    // call restaurant update service
    const updatedRestaurant = await updateExistingRestaurant(
      restaurantData,
      coverImageFile,
      id
    );

    res.status(200).json({
      success: true,
      data: updatedRestaurant,
      message: `Restaurant updated successfully`,
    });
  }
);

/**
  @desc    DELETE AN RESTAURANT
  @route   /api/restaurants/:id
  @access  private
*/
export const deleteRestaurant = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user;
    const { id } = req.params;

    // check if the correct merchant is deleting the restaurant
    await foundMerchantRestaurant(id, user._id);

    // call restaurant delete service
    await Restaurant.findOneAndDelete({ _id: id });

    res.status(200).json({
      success: true,
      data: null,
      message: `Restaurant deleted successfully`,
    });
  }
);
