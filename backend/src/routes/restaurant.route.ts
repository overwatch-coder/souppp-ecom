import express from "express";
import {
  getAllRestaurants,
  getSingleRestaurant,
  createRestaurant,
  deleteRestaurant,
  updateRestaurant,
} from "@/controllers/restaurant.controller";
import { isUserMerchant, isUserProtected } from "@/middleware/auth.middleware";
import { validateRequest } from "@/middleware/validateRequest.middleware";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
} from "@/schema/restaurant.schema";

const router = express.Router();

router.use(isUserProtected);
router.get("/", getAllRestaurants);
router.get("/:id", getSingleRestaurant);

router.use(isUserMerchant);
router.post("/", validateRequest(createRestaurantSchema), createRestaurant);
router.patch("/:id", validateRequest(updateRestaurantSchema), updateRestaurant);
router.delete("/:id", deleteRestaurant);

export default router;
