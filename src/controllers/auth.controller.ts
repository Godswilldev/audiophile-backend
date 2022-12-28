import "dotenv/config";
import crypto from "crypto";
import validator from "validator";
import User from "../models/user.model";
import { UserProps } from "../interface/user.interface";
import { Response, Request, NextFunction } from "express";
import {
  createSendToken,
  semdEmailVerificationLink,
  sendForgotPasswordToken,
} from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/handleAppError.middleware";
import { Email } from "./../utils/email.util";
import moment from "moment";

// signup user
export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  const { firstname, lastname, email, password, passwordConfirm, phoneNumber }: UserProps =
    req.body;
  // create user
  const user = await User.create({
    phoneNumber,
    email,
    password,
    lastname,
    firstname,
    passwordConfirm,
  });

  const emailToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  await semdEmailVerificationLink(req, res, next, { user, emailToken });
};

// SEND USER A CONFIRMATION EMAIL CODE
export const confirmEmail = async (req: Request, res: Response, next: NextFunction) => {
  const confirmationCode = req.params.token;
  const hashedToken = crypto.createHash("sha256").update(confirmationCode).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: moment() },
  })
    .select("-password")
    .select("-passwordChangedAt");

  if (!user) {
    return next(new AppError("Token expired or invalid", 400));
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const sendUser = {
    id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    photo: user.photo,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };

  createSendToken(sendUser, 200, res);
};

// RESEND CONFIRMATION EMAIL CODE
export const resendEmailConfirmationToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  // check if email is valid
  if (!email || !validator.isEmail(email)) {
    return next(new AppError("Please provide a valid email", 400));
  }
  // check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 401));
  }

  if (user.isEmailVerified) {
    return next(new AppError("Email Already Verified", 403));
  }
  const emailToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  await semdEmailVerificationLink(req, res, next, { user, emailToken });
};

// LOGIN USER
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  // check if email and password is entered and if email is valid
  if (!email || !password || !validator.isEmail(email)) {
    return next(new AppError("Please provide a valid email or password", 400));
  }
  // check if user exists
  const user = await User.findOne({ email }).select("+password").select("-passwordChangedAt");
  // check if the password is correct
  const validPassword = await user?.comparePasswords(password, user.password);
  // return an error if anything is incorrect
  if (!user || !validPassword) {
    return next(new AppError("Invalid Login credentials", 401));
  }
  if (!user.isEmailVerified) {
    return next(new AppError("Please verify your email", 401));
  }

  const sendUser = {
    id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    photo: user.photo,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };
  createSendToken(sendUser, 200, res);
};

// SEND FORGOT PASSWORD CODE
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  await sendForgotPasswordToken(req, res, next, { resetToken, user });
};

// RESEND FORGOT PASSWORD CODE
export const resendForgotPasswordToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  await sendForgotPasswordToken(req, res, next, { resetToken, user });
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { resetToken, password, passwordConfirm } = req.body;

  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: moment() },
  }).select("-passwordChangedAt");

  if (!user) {
    return next(new AppError("Token expired or invalid", 400));
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  const sendUser = {
    id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    photo: user.photo,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };

  createSendToken(sendUser, 200, res);
};

// UPDATE PASSWORD AFTER RESETTING IS SUCCESSFUL
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  // get user from collection
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;

  // check if user exists
  const user = await User.findById(req.user.id).select("+password").select("-passwordChangedAt");

  // check if posted current password is correct
  const validPassword = await user?.comparePasswords(oldPassword, user.password);
  // return an error if anything is incorrect
  if (!user || !validPassword) {
    return next(new AppError("Wrong password", 401));
  }
  // if so, update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  const sendUser = {
    id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    isEmailVerified: user.isEmailVerified,
    photo: user.photo,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };
  createSendToken(sendUser, 200, res);
};

// LOGOUT PASSWORD
export const logout = async (req: Request, res: Response) => {
  res.cookie("jwt", "null", { httpOnly: true });
  return res.status(200).json({ status: "Logged Out Successfully" });
};

export const testEmail = async (req: Request, res: Response) => {
  const { email, firstname } = req.body;
  const SendEmail = new Email({ email, firstname });

  await SendEmail.sendWelcome();
  return res.status(201).json({ status: "Successful", message: "Email Sent" });
};
