import { Router } from "express";
import { frontendVerifyCookie } from "../middlewares/auth.middleware";
import { catchAsync } from "../middlewares/catchAsyncError.middleware";
import {
  login,
  logout,
  signUp,
  confirmEmail,
  resetPassword,
  forgotPassword,
  resendEmailConfirmationToken,
  testEmail,
} from "./../controllers/auth.controller";

const authRouter = Router();

authRouter.route("/test-email").post(catchAsync(testEmail));

// VERIFY COOKIE FROM THE FRONTEND
authRouter.route("/verify-cookie").get(catchAsync(frontendVerifyCookie));

// SIGNUP USER
authRouter.route("/register").post(catchAsync(signUp));

// CONFIRM EMAIL
authRouter.route("/verify-email/:token").post(catchAsync(confirmEmail));

// RESEND EMAIL CONFIRMATION CODE
authRouter.route("/resend-email-confirmation-code").post(catchAsync(resendEmailConfirmationToken));

// LOGIN USER
authRouter.route("/login").post(catchAsync(login));

// LOGOUT USER
authRouter.route("/logout").post(catchAsync(logout));

// FORGOT PASSWORD
authRouter.route("/forgot-password").patch(catchAsync(forgotPassword));

// PASSWORD RESET
authRouter.route("/reset-password").post(catchAsync(resetPassword));

// RESEND FORGOT PASSWORD CODE
authRouter.route("/resend-forgot-password-code").patch(catchAsync(forgotPassword));

export default authRouter;
