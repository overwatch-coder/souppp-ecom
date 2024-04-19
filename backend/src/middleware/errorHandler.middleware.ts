// import { Request, Response, NextFunction } from "express";
// import { CastError } from "mongoose";

// interface ErrorRequestType extends CastError {}

// export const notFound = (req: Request, res: Response, next: NextFunction) => {
//   const error = new Error(`Not Found - ${req.originalUrl}`);
//   res.status(404);
//   next(error);
// };

// export const errorHandler = (
//   err: ErrorRequestType,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
//   let message = err.message;

//   // If Mongoose not found error, set to 404 and change message
//   if (err.name === "CastError" && err.kind === "ObjectId") {
//     statusCode = 404;
//     message = "Resource not found";
//   }

//   res.status(statusCode).json({
//     message: message,
//     stack: process.env.NODE_ENV === "production" ? null : err.stack,
//     success: false,
//     data: null,
//   });
// };
