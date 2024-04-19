import { Request, Response, NextFunction } from "express";
import { CastError } from "mongoose";

// Define an enum for HTTP status codes
export enum HttpStatusCode {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}

// Define a mapping of error messages to status codes
const errorMessageToStatusCode: { [key: string]: HttpStatusCode } = {
  "Bad Request": HttpStatusCode.BadRequest,
  Unauthorized: HttpStatusCode.Unauthorized,
  Forbidden: HttpStatusCode.Forbidden,
  "Not Found": HttpStatusCode.NotFound,
  "Internal Server Error": HttpStatusCode.InternalServerError,
};

// Custom HTTP error class
export class HttpError extends Error {
  statusCode: HttpStatusCode;
  kind?: CastError;

  constructor(statusCode: HttpStatusCode, message: string, kind?: CastError) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.kind = kind;
  }
}

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError(
    HttpStatusCode.NotFound,
    `Not Found - ${req.originalUrl}`
  );
  res.status(HttpStatusCode.NotFound);
  next(error);
};

// Error handler function
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default status code is 500 (Internal Server Error)
  let statusCode: HttpStatusCode = HttpStatusCode.InternalServerError;

  // Check if the error has a known HTTP status code
  if (
    (err as HttpError).statusCode &&
    Object.values(HttpStatusCode).includes((err as HttpError).statusCode)
  ) {
    statusCode = (err as HttpError).statusCode;
  }

  // If Mongoose not found error, set to 404 and change message
  if (
    (err as CastError).name === "CastError" &&
    (err as CastError).kind === "ObjectId"
  ) {
    statusCode = 500;
    err.message = "Invalid Object Id";
  }

  // if (err.type)
  // Log the error
  console.error({ err, in: "errorHandler" });

  // Send the appropriate HTTP response
  res.status(statusCode).json({
    error: {
      message:
        err.message ||
        errorMessageToStatusCode[err.message] ||
        "Internal Server Error",
    },
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
    success: false,
    data: null,
  });
};

// Custom HTTP error function
export const createHttpError = (
  message: string,
  statusCode?: HttpStatusCode
): HttpError => {
  if (!statusCode) {
    // Infer status code from the message
    statusCode =
      errorMessageToStatusCode[message] || HttpStatusCode.InternalServerError;
  }

  const error: any = new HttpError(statusCode, message);

  return error;
};
