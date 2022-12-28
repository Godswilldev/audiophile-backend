/* eslint-disable indent */
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Types } from "mongoose";
import { roles } from "../interface/user.interface";
import User from "../models/user.model";
// import { Email } from "../utils/email.util";
import { AppError } from "./handleAppError.middleware";
import { Request, Response, NextFunction } from "express";
import { Email } from "../utils/email.util";

const { JWT_SECRET, NODE_ENV } = process.env;

// FUNCTION TO SIGN THE JWT
export const signJwt = (id: Types.ObjectId) =>
  jwt.sign({ id }, JWT_SECRET as string, { expiresIn: "7d" });

// FUNCTION TO PROTECT ROUTES
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization?.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError("You are not logged in Please provide a token", 400));
  }

  const verify = jwt.verify(token, JWT_SECRET as string);

  const decoded = verify as jwt.JwtPayload;
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError("The user belonging to this token doesn't exist", 401));
  }

  if (currentUser.changedPasswordAfter(decoded?.iat ?? 0)) {
    return next(new AppError("User recently changed password! Please login again", 401));
  }

  const sendUser = {
    id: currentUser._id,
    firstname: currentUser.firstname,
    lastname: currentUser.lastname,
    email: currentUser.email,
    isEmailVerified: currentUser.isEmailVerified,
    photo: currentUser.photo,
    role: currentUser.role,
  };

  if (!sendUser.isEmailVerified) {
    return next(new AppError("Email not verified, Please verify your email", 401));
  }

  req.user = sendUser;
  next();
};

// FUNCTION TO VERIFY USER TOKEN ON THE FRONTEND
export const frontendVerifyCookie = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization?.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token || token == "null") {
    return next(new AppError("You are not logged in Please provide a token", 403));
  }

  const verify = jwt.verify(token, JWT_SECRET as string);

  const decoded = verify as jwt.JwtPayload;
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError("The user belonging to this token doesn't exist", 401));
  }

  if (currentUser.changedPasswordAfter(decoded?.iat ?? 0)) {
    return next(new AppError("User recently changed password! Please login again", 401));
  }

  const sendUser = {
    id: currentUser._id,
    firstname: currentUser.firstname,
    lastname: currentUser.lastname,
    email: currentUser.email,
    isEmailVerified: currentUser.isEmailVerified,
    photo: currentUser.photo,
    role: currentUser.role,
  };

  if (!sendUser.isEmailVerified) {
    return next(new AppError("Email not verified, Please verify your email", 401));
  }

  return res.status(200).json({ status: "Success", token, data: sendUser });
};

// FUNCTION FOR RESTRICTION / AUTHORIZATION
export const restrictTo =
  ([...userRoles]: roles[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!userRoles.includes(req.user?.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };

// STANDARD RESPONSE FUNCTION
export const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signJwt(user.id);

  res.cookie("jwt", token, {
    httpOnly: NODE_ENV === "production" ? true : false,
    secure: NODE_ENV === "production" ? true : false,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    sameSite: "none",
  });

  // send to client
  return res.status(statusCode).json({ status: "Success", token, data: { user } });
};

// FUNCTION TO SEND EMAIL VERIFICATION LINK
export const semdEmailVerificationLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
  { user, emailToken }: any
) => {
  try {
    // const verifyUrl = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/v1/auth/confirm-email/${emailToken}`;

    // eslint-disable-next-line max-len
    const html = `
           <h3>Welcome to Audiophile. Your one stop online store for all your Audio needs</h3>
           <h1> ${emailToken} </h1> <span> is your Email Verification Code</span>
           <h4>Verification code is Valid for 10 minutes</h4>
    `;
    await new Email(user).send(html, "Welcome to Audiophile");

    return res
      .status(201)
      .json({ status: "Successful", message: "Verification Code sent to Email" });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(`There was an error sending the Verification Code ${error}`, 500));
  }
};

// FUNCTION TO SEND FORGOT PASSWORD EMAIL TOKEN
export const sendForgotPasswordToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
  { resetToken, user }: any
) => {
  try {
    // eslint-disable-next-line max-len
    const html = `<h2>${resetToken} is your password reset token.</h2><h4>Valid for 10 minutes</h4>`;
    await new Email(user).send(html, "Password Reset Token");

    return res
      .status(200)
      .json({ status: "success", message: "Password Reset Token sent to Email" });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(`There was an error sending the token ${error}`, 500));
  }
};
