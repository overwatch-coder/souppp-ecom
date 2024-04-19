import {
  addProductToFavorite,
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  removeProductFromFavorite,
  updateProduct,
} from "@/controllers/product.controller";
import { isUserMerchant, isUserProtected } from "@/middleware/auth.middleware";
import { validateRequest } from "@/middleware/validateRequest.middleware";
import { createProductSchema, productSchema } from "@/schema/product.schema";
import express from "express";

const router = express.Router();


// all users who are authenticated can do these
router.use(isUserProtected);

router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);
router.post("/:id/favorite", addProductToFavorite);
router.patch("/:id/favorite", removeProductFromFavorite);

// only users with role = MERCHANT can do these
router.use(isUserMerchant);
router.post("/", validateRequest(createProductSchema), createProduct);
router.patch("/:id", validateRequest(productSchema.partial()), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
