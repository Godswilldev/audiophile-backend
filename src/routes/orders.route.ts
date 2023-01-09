import { Router } from "express";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import {
  createOrder,
  getOrder,
  getUserOrder,
  updateOrder,
  deleteOrder,
  getAllOrders,
} from "../controllers/orders.controller";
import { catchAsync } from "../middlewares/catchAsyncError.middleware";
import { getCheckoutsession } from "../controllers/flutterwave.controller";
import { roles } from "../interface/user.interface";

const ordersRouter = Router();

// PROTECT ALL ORDER ROUTES
ordersRouter.use(catchAsync(protect));

ordersRouter.route("/checkout-session").post(catchAsync(getCheckoutsession));
ordersRouter.route("/my-orders").get(catchAsync(getUserOrder));

ordersRouter
  .route("/")
  .post(catchAsync(createOrder))
  .get(restrictTo([roles.admin]), catchAsync(getAllOrders));

ordersRouter
  .route("/:id")
  .get(catchAsync(getOrder))
  .patch(restrictTo([roles.admin]), catchAsync(updateOrder))
  .delete(restrictTo([roles.admin]), catchAsync(deleteOrder));

export default ordersRouter;
