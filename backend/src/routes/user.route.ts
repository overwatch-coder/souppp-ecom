import {
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  requestVerificationCode,
  resetPassword,
  verifyUser,
} from "@/controllers/user.controller";
import {
  createUserSchema,
  loginUserSchema,
  verifyUserSchema,
} from "@/schema/user.schema";
import { validateRequest } from "@/middleware/validateRequest.middleware";
import { Router } from "express";

const router = Router();

router.post("/register", validateRequest(createUserSchema), registerUser);
router.post("/login", validateRequest(loginUserSchema), loginUser);
router.post("/verify", validateRequest(verifyUserSchema), verifyUser);
router.post("/request-code", requestVerificationCode);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logoutUser);

export default router;
