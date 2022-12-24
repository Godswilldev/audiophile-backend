import { Router } from "express";
import { roles } from "../interface/user.interface";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import { catchAsync } from "../middlewares/catchAsyncError.middleware";
import {
  getAllReviews,
  createReview,
  deleteReview,
  getOneReview,
} from "../controllers/review.controller";

const reviewsRouter = Router({ mergeParams: true });

// protect all reviews endpoint
reviewsRouter.use(catchAsync(protect));

reviewsRouter
  .route("/")
  .get(catchAsync(getAllReviews))
  .post(restrictTo([roles.user]), catchAsync(createReview));

reviewsRouter
  .route("/:id")
  .delete(restrictTo([roles.admin]), catchAsync(deleteReview))
  .get(restrictTo([roles.manager, roles.admin]), catchAsync(getOneReview));

export default reviewsRouter;
