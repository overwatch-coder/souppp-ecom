import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
} from "@/controllers/order.controller";
import { isUserMerchant, isUserProtected } from "@/middleware/auth.middleware";
import { validateRequest } from "@/middleware/validateRequest.middleware";
import { orderSchema, updateOrderSchema } from "@/schema/order.schema";
import express from "express";

const router = express.Router();

router.use(isUserProtected);

router.get("/", getAllOrders);
router.get("/:id", getSingleOrder);

router.use(isUserMerchant);
router.post("/", validateRequest(orderSchema), createOrder);
router.patch("/:id", validateRequest(updateOrderSchema), updateOrder);
router.delete("/:id", deleteOrder);

export default router;
