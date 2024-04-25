import { rateLimit } from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 5, // limit each IP to 5 requests per minute
  message: {
    error: "Too many requests, please try again after 1 minute",
    data: null,
    success: false,
  },
  standardHeaders: "draft-7", // Return rate limit info in the `RateLimit-*` headers
  statusCode: 429,
  legacyHeaders: false,
});
