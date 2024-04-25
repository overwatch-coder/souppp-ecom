import 'module-alias/register';

// configure env in the entire application
import dotenv from "dotenv";
dotenv.config();

// import packages
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import fileUpload from "express-fileupload";

// import config
import { connectDB } from "@/config/db";
import { rateLimiter } from "@/lib/rateLimiter";

// middleware imports
import { errorHandler, notFound } from "@/middleware/error.middleware";

// route imports
import userRoutes from "@/routes/user.route";
import authRoutes from "@/routes/auth.route";
import orderRoutes from "@/routes/order.route";
import productRoutes from "@/routes/product.route";
import restaurantRoutes from "@/routes/restaurant.route";
import stripeRoutes from "@/routes/payment.route";
import statusRoutes from "@/routes/status.route";
import { logger } from "@/lib/logger";

const initializeServer = async () => {
  // initialise app
  const app = express();

  // connect mongoDB
  await connectDB();

  // apply middleware
  app.use(helmet());
  app.use(cors());
  app.use("/api", rateLimiter);
  app.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api/payment/stripe-webhook")) {
      next();
    } else {
      express.json()(req, res, next);
    }
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (process.env.NODE_ENV !== "production") {
    app.use(
      morgan("combined", {
        stream: {
          write: (message: string) => logger.log(logger.level, message),
        },
      })
    );
  }

  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
      createParentPath: true,
    })
  );

  // routes
  app.use("/api/users", userRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/restaurants", restaurantRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/payment", stripeRoutes);
  app.use("/status", statusRoutes);

  // catch-all route
  app.use("*", (req, res) => {
    res.redirect(process.env.DOCS_URL!);
  });

  // Error middleware
  app.use(notFound);
  app.use(errorHandler);

  // connect to mongoDB and listen to app
  const port = process.env.PORT || 8000;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

initializeServer();
