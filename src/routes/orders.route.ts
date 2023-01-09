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
import { roles } from "../interface/user.interface";
import { catchAsync } from "../middlewares/catchAsyncError.middleware";
import { getFlutterwaveCheckoutSession } from "../controllers/flutterwave.controller";
import { getPaystackCheckoutSession } from "../controllers/paystack.controller";

const ordersRouter = Router();

// PROTECT ALL ORDER ROUTES
ordersRouter.use(catchAsync(protect));

ordersRouter.route("/flutterwave-checkout-session").post(catchAsync(getFlutterwaveCheckoutSession));
ordersRouter.route("/paystack-checkout-session").post(catchAsync(getPaystackCheckoutSession));
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
