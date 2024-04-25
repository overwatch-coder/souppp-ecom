import jwt from "jsonwebtoken";
import { NextFunction, Response, Request } from "express";
import asyncHandler from "express-async-handler";
import User from "@/models/user.model";
import { createHttpError, HttpStatusCode } from "@/middleware/error.middleware";

interface PayloadData {
  userId: string;
}

// check if user is authorized
export const isUserProtected = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { access_token } = req.cookies;
    const authorisationToken = req.headers.authorization?.split(" ")[1];

    // throw an error if token from both cookies and headers isn't present
    if (!access_token && !authorisationToken) {
      throw createHttpError(
        "Not authorized, no token found.",
        HttpStatusCode.Forbidden
      );
    }

    let decoded: PayloadData = { userId: "" };
    if (access_token) {
      decoded = jwt.verify(
        access_token,
        process.env.JWT_SECRET!
      ) as PayloadData;
    } else if (authorisationToken) {
      decoded = jwt.verify(
        authorisationToken,
        process.env.JWT_SECRET!
      ) as PayloadData;
    }

    if (!decoded || !decoded.userId || decoded.userId === "") {
      throw createHttpError(
        "Not authorized, token expired. Please login again",
        HttpStatusCode.Forbidden
      );
    }

    const user = await User.findOne({ _id: decoded.userId }).select(
      "-password"
    );

    if (!user) {
      throw createHttpError(
        "Forbidden!. You must be logged in to access this page.",
        HttpStatusCode.Forbidden
      );
    }

    req.user = user;
    next();
  }
);

// check if logged in user is an merchant
export const isUserMerchant = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user;

    if (role !== "MERCHANT") {
      throw createHttpError(
        "Forbidden!. Not authorized to access this page.",
        HttpStatusCode.Forbidden
      );
    }

    next();
  }
);
