import { ErrorRequestHandler, Response } from "express";
import { AppError } from "../middlewares/handleAppError.middleware";

const handleCastErrorDB = (err: { path: any; value: any }) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: { errmsg: { match: (arg0: RegExp) => any[] } }) => {
  const message = "Email Already Exists. Please use another Email!";
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: {
  errors: { [s: string]: unknown } | ArrayLike<unknown>;
}) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () => new AppError("Invalid Token, Please sign up", 401);
const handleTokenExpiredError = () => new AppError("Session expired, Please Login again", 401);

const sendDevError = (err: { statusCode: any; status: any; message: any }, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
  });
};

const sendProdError = (err: any, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("Error, 🔥🔥🔥", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong",
    });
  }
};

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJsonWebTokenError();
    if (error.name === "TokenExpiredError") error = handleTokenExpiredError();

    sendProdError(error, res);
  }
};
