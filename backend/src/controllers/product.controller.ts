import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { CreateProductType, UpdateProductType } from "@/schema/product.schema";
import Product from "@/models/product.model";
import {
  addProduct,
  removeProduct,
  updateExistingProduct,
  addProductToUserFavorites,
  removeProductFromUserFavorites,
} from "@/services/product.service";
import { UploadedFile } from "express-fileupload";
import slugify from "slugify";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";
import { foundMerchantRestaurant } from "@/services/restaurant.service";

/**
  @desc    GET ALL PRODUCTS
  @route   /api/products
  @access  private
*/
export const getAllProducts = asyncHandler(
  async (
    req: Request<any, any, any, { limit?: string; page?: string }>,
    res: Response
  ) => {
    const user = req.user;

    const products = await Product.paginate(
      { merchant: user._id },
      {
        limit: parseInt(req.query.limit as string) || 20,
        page: parseInt(req.query.page as string) || 1,
        sort: { createdAt: -1 },
        populate: [{ path: "merchant", select: "name username image _id" }],
      }
    );

    res.status(200).json({
      success: true,
      data: products,
      message: "All products",
    });
  }
);

/**
  @desc    GET A SINGLE PRODUCT
  @route   /api/products/:id
  @access  private
*/
export const getSingleProduct = asyncHandler(
  async (req: Request<{ id: string }, any, any>, res: Response) => {
    const user = req.user;
    const { id } = req.params;

    const product = await Product.findOne({
      $and: [{ merchant: user._id }, { _id: id }],
    })
      .populate("users")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!product) {
      throw createHttpError("Product not found", HttpStatusCode.NotFound);
    }

    res.status(200).json({
      success: true,
      data: product,
      message: `Single product retrieved successfully`,
    });
  }
);

/**
  @desc    CREATE AN PRODUCT
  @route   /api/products
  @access  private
*/
export const createProduct = asyncHandler(
  async (req: Request<any, any, CreateProductType>, res: Response) => {
    const user = req.user;
    const product = req.body;
    const coverImageFile = req.files?.coverImage as UploadedFile;
    const imagesFile = req.files?.images;

    if (!coverImageFile) {
      throw createHttpError(
        "Cover image is required",
        HttpStatusCode.BadRequest
      );
    }

    // check if merchant is adding product to their own restaurant
    await foundMerchantRestaurant(product.restaurant, user._id);

    const productNameAndSlugExists = await Product.findOne({
      $or: [{ name: product.name }, { slug: slugify(product.name) }],
    });

    if (productNameAndSlugExists) {
      throw createHttpError(
        "Product name and slug already exists. Choose another one",
        HttpStatusCode.BadRequest
      );
    }

    const createdProduct = await addProduct(user._id.toString(), {
      ...product,
      coverImageFile,
      imagesFile: Array.isArray(imagesFile) ? imagesFile : Array(imagesFile),
    });

    res.status(201).json({
      success: true,
      data: createdProduct,
      message: `Product created successfully`,
    });
  }
);

/**
  @desc    UPDATE AN EXISTING PRODUCT
  @route   /api/products/:id
  @access  private
*/
export const updateProduct = asyncHandler(
  async (
    req: Request<{ id: string }, any, UpdateProductType>,
    res: Response
  ) => {
    const user = req.user;
    const { id } = req.params;
    const coverImageFile = req.files?.coverImage as UploadedFile;
    const imagesFile = req.files?.images as UploadedFile[];
    const product = { ...req.body, coverImageFile, imagesFile };

    const updatedProduct = await updateExistingProduct(
      user._id.toString(),
      id,
      product
    );

    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: `Product updated successfully`,
    });
  }
);

/**
  @desc    ADD A PRODUCT TO FAVORITE
  @route   /api/products/:id/favorite
  @access  private
*/
export const addProductToFavorite = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user;
    const { id } = req.params;

    // check if product with that id already exists
    const product = await Product.findById(id);

    if (!product) {
      throw createHttpError("Product not found", HttpStatusCode.NotFound);
    }

    // check if the product owner isn't the same as currently logged in user
    if (product?.merchant.toString() === user._id.toString()) {
      throw createHttpError(
        "You can't add your own product to favorites",
        HttpStatusCode.BadRequest
      );
    }

    const updatedUserWithFavorite = await addProductToUserFavorites(
      user._id.toString(),
      id
    );

    res.status(200).json({
      success: true,
      data: updatedUserWithFavorite,
      message: `Product successfully added to favorites`,
    });
  }
);

/**
  @desc    REMOVE A PRODUCT FROM FAVORITES
  @route   /api/products/:id/favorite
  @access  private
*/
export const removeProductFromFavorite = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user;
    const { id } = req.params;

    // check if product with that id already exists
    const product = await Product.findById(id);

    if (!product) {
      throw createHttpError("Product not found", HttpStatusCode.NotFound);
    }

    const updatedUserWithFavorite = await removeProductFromUserFavorites(
      user._id.toString(),
      id
    );

    res.status(200).json({
      success: true,
      data: updatedUserWithFavorite,
      message: `Add product with id=${id} to favorites`,
    });
  }
);

/**
  @desc    DELETE AN PRODUCT
  @route   /api/products/:id
  @access  private
*/
export const deleteProduct = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user;
    const { id } = req.params;

    await removeProduct(user._id.toString(), id);

    res.status(200).json({
      success: true,
      data: null,
      message: `Product deleted successfully`,
    });
  }
);
