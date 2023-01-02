import { Response, Request } from "express";
import {
  deleteHandler,
  getOneHandler,
  updateHandler,
} from "../middlewares/handlerFactory.controller";
import Order from "../models/orders.model";

// CREATE ORDER
export const createOrder = async (req: Request, res: Response) => {
  const { orderItems, shippingInfo } = req.body;
  const { id } = req.user;
  const order = await Order.create({ orderItems, shippingInfo, user: id });
  return res.status(201).json({ status: "Order Created Successfully", data: { order } });
};

// GET USER ORDER
export const getUserOrder = async (req: Request, res: Response) => {
  const order = await Order.find({ user: req.user.id });
  return res.status(200).json({ status: "success", data: { order } });
};

// GET ALL ORDERS
export const getAllOrders = async (req: Request, res: Response) => {
  const order = await Order.find();
  return res.status(200).json({ status: "success", data: { order } });
};

export const getOrder = getOneHandler(Order);
export const updateOrder = updateHandler(Order);
export const deleteOrder = deleteHandler(Order);
