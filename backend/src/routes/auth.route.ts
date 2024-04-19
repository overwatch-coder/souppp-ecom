import {
  merchantUser,
  userProfile,
  userDelete,
  userUpdate,
  uploadAvatar
} from "@/controllers/auth.controller";
import {
  isUserMerchant,
  isUserProtected,
} from "@/middleware/auth.middleware";
import { validateRequest } from "@/middleware/validateRequest.middleware";
import { userSchema } from "@/schema/user.schema";
import express from "express";

const router = express.Router();

router.use(isUserProtected);

router.get("/profile", userProfile);
router.patch("/update", validateRequest(userSchema.partial()), userUpdate);
router.post("/upload", uploadAvatar);
router.delete("/delete", userDelete);

router.get("/merchant", isUserMerchant, merchantUser);

export default router;
