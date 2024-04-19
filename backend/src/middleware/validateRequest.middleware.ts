import { NextFunction, Request, Response } from "express";
import { Schema } from "zod";
import asyncHandler from "express-async-handler";

export const validateRequest = (schema: Schema) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const results = await schema.safeParseAsync(req.body);

    if (!results.success) {
      res.status(400).json({
        errors: results.error.errors.map((err) => err.message),
        success: false,
        data: null,
      });
      return;
    }

    req.body = results.data;
    next();
  });
