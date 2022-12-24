import { Router } from "express";
import { roles } from "../interface/user.interface";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import { catchAsync } from "../middlewares/catchAsyncError.middleware";
import { uploadUserPhoto, resizeUserPhoto } from "../middlewares/user.middleware";

import {
  getAllUsers,
  updateMe,
  deleteMe,
  deleteUser,
  getUser,
  favouriteProducts,
  getMe,
  updateUser,
} from "../controllers/user.controller";

import { updatePassword } from "../controllers/auth.controller";

const usersRouter = Router();

// Protect ALL ROUTES AFTER THIS MIDDLEWARE
usersRouter.use(catchAsync(protect));

// GET ME
usersRouter.route("/me").get(catchAsync(getMe), catchAsync(getUser));

// USER UPDATING THEIR USER INFO (name, email, address)
usersRouter
  .route("/update-me")
  .patch(uploadUserPhoto, catchAsync(resizeUserPhoto), catchAsync(updateMe));

// USER DELETING THEIR ACCOUNT
usersRouter.route("/delete-me").delete(catchAsync(deleteMe));

// USER UPDATING THEIR PASSWORD
usersRouter.route("/update-password").patch(catchAsync(updatePassword));

// GET ALL USERS
usersRouter.route("/").get(restrictTo([roles.admin, roles.manager]), catchAsync(getAllUsers));

usersRouter
  .route("/:id")
  .delete(restrictTo([roles.admin]), catchAsync(deleteUser))
  .patch(restrictTo([roles.admin]), catchAsync(updateUser))
  .get(restrictTo([roles.admin, roles.manager]), catchAsync(getUser));

usersRouter.route("/favourite-products").post(catchAsync(protect), catchAsync(favouriteProducts));

export default usersRouter;
