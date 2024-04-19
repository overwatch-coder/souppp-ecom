import express, { Request, Response } from "express";
import stripe from "@/config/stripe";
import { webhookCheckoutCompletedSchema } from "@/schema/payment.schema";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";

const router = express.Router();

// test endpoints

// for stripe
router.get(
  "/order-status",
  async (req: Request<{}, {}, {}, { session_id?: string }>, res: Response) => {
    try {
      const session_id = req.query?.session_id;

      if (!session_id) {
        return res.status(400).json({
          message: "Session ID is required",
          success: false,
          data: null,
        });
      }

      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (!session) {
        return res.status(404).json({
          message: "Session not found",
          success: false,
          data: null,
        });
      }

      const validatedSession =
        webhookCheckoutCompletedSchema.safeParse(session);

      res.status(200).json({
        message: "Welcome to Souppp API: Stripe Payment Successful",
        success: validatedSession.success,
        data: validatedSession.success
          ? validatedSession.data
          : validatedSession.error.errors.map((err) => err.message),
      });
    } catch (err: any) {
      console.log("checkout success session error:", { err });
      res.status(err?.raw?.statusCode || 500).json({
        message: err?.raw?.message || err?.message || "Internal Server Error",
        success: false,
        data: null,
      })
    }
  }
);

router.get("/cart", (req: Request, res: Response) => {
  res.status(500).json({
    message: "Back to cart page without processing payment",
    success: false,
    data: null,
  });
});

export default router;
