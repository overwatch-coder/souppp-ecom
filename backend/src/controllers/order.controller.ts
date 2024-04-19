import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { UpdateOrderType } from "@/schema/order.schema";
import Order from "@/models/order.model";
import {
  createCompletedOrder,
  updateOrderService,
} from "@/services/order.service";
import { CreateCompletedOrderType } from "@/schema/payment.schema";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";

/**
  @desc    GET ALL ORDERS
  @route   /api/orders
  @access  private
*/
export const getAllOrders = asyncHandler(
  async (
    req: Request<any, any, any, { limit?: string; page?: string }>,
    res: Response
  ) => {
    const user = req.user;

    // only users can view this page
    if (user.role !== "USER") {
      throw createHttpError(
        "Only clients can view this page",
        HttpStatusCode.Forbidden
      );
    }

    const orders = await Order.paginate(
      { "customer.user": user._id },
      {
        limit: parseInt(req.query.limit as string) || 20,
        page: parseInt(req.query.page as string) || 1,
        sort: { createdAt: -1 },
        populate: [
          {
            path: "items.product",
            populate: {
              path: "restaurant",
              select: "name slug _id merchant",
              populate: { path: "merchant", select: "name username" },
            },
            options: { lean: true },
          },
        ],
      }
    );

    // check if there are no orders
    if (orders.totalDocs === 0) {
      res.status(200).json({
        success: true,
        data: [],
        message: "You do not have any orders yet",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
      message: "All orders retrieved successfully",
    });
  }
);

/**
  @desc    GET A SINGLE ORDER
  @route   /api/orders/:id
  @access  private
*/
export const getSingleOrder = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user;
    const { id } = req.params;

    // only users can view this page
    if (user.role !== "USER") {
      throw createHttpError(
        "Only clients can view this page",
        HttpStatusCode.Forbidden
      );
    }

    const order = await Order.findOne({
      $and: [{ _id: id }, { "customer.email": user.email }],
    })
      .populate("customer.user", "-password -updatedAt -products -codes")
      .populate({
        path: "items.product",
        populate: {
          path: "restaurant",
          select: "name slug _id merchant",
          populate: { path: "merchant", select: "name username" },
        },
        options: { lean: true },
      })
      .exec();

    if (!order) {
      throw createHttpError("Order not found", HttpStatusCode.NotFound);
    }

    res.status(200).json({
      success: true,
      data: order,
      message: `Order retrieved successfully`,
    });
  }
);

/**
  @desc    CREATE AN ORDER
  @route   /api/orders
  @access  private
*/
export const createOrder = asyncHandler(
  async (req: Request<any, any, CreateCompletedOrderType>, res: Response) => {
    const data = req.body;

    if (!data || data.status !== "complete") {
      throw createHttpError(
        "Cannot create an order while the payment is not completed",
        HttpStatusCode.BadRequest
      );
    }

    const order = await createCompletedOrder(data);

    if (!order) {
      throw createHttpError(
        "An error occurred while creating the order. Try again later.",
        HttpStatusCode.InternalServerError
      );
    }

    res.status(200).json({
      success: true,
      data: order,
      message: `Order created successfully`,
    });
  }
);

/**
  @desc    UPDATE AN ORDER
  @route   /api/orders/:id
  @access  private
*/
export const updateOrder = asyncHandler(
  async (req: Request<{ id: string }, any, UpdateOrderType>, res: Response) => {
    const user = req.user;
    const data = req.body;

    if (!data.orderStatus || !data.restaurant) {
      throw createHttpError(
        "Order status and restaurant ID are required",
        HttpStatusCode.BadRequest
      );
    }

    // call the update order service
    const updatedOrder = await updateOrderService(user, data, req.params.id);

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: `Order updated successfully`,
    });
  }
);

/** 
  @desc    DELETE AN ORDER
  @route   /api/orders/:id
  @access  private
*/
export const deleteOrder = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = req.user;

    const deletedOrder = await Order.findOneAndDelete({
      $and: [{ _id: req.params.id }, { "customer.email": user.email }],
    });

    if (!deletedOrder) {
      throw createHttpError(
        "An error occurred while deleting the order. Try again later.",
        HttpStatusCode.InternalServerError
      );
    }

    res.status(200).json({
      success: true,
      data: null,
      message: `Order deleted successfully`,
    });
  }
);
