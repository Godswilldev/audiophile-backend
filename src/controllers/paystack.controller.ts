/* eslint-disable max-len */
import "dotenv/config";
import axios from "axios";
import crypto from "crypto";
import Order from "../models/orders.model";
import { Email } from "../utils/email.util";
import { Response, Request, NextFunction } from "express";
import { OrderStatus } from "../interface/orders.interface";
import { AppError } from "../middlewares/handleAppError.middleware";

// GET FLUTTERWAVE CHECKOUT SESSION
export const getPaystackCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { orderItems, shippingInfo } = req.body;
  const user = req.user;

  if (!orderItems || !shippingInfo || orderItems?.length < 1) {
    return next(new AppError("Order must have either a shipping info or order items", 400));
  }

  const order = await Order.create({ orderItems, shippingInfo, user: user.id });

  const { data } = await axios({
    method: "post",
    url: "https://api.paystack.co/transaction/initialize",

    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },

    data: {
      key: `${process.env.PAYSTACK_PUBLIC_KEY}`,
      ref: order.id,
      amount: order.grandTotal * 100,
      currency: "NGN",
      customer: {
        email: user.email,
        first_name: `${user.firstname}`,
        last_name: `${user.lastname}`,
      },

      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],

      metadata: { orderDetails: order.orderItems, shippingInfo: order.shippingInfo },
    },
  });
  return res.status(200).json(data);
};

// PAYSTACK CHECKOUT WEBHOOK
export const paystackWebhook = async (req: Request, res: Response) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = req.headers["x-paystack-signature"];

  const hash = crypto
    .createHmac("sha512", secret as string)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) {
    // This request isn't from Paystack; discard
    return res.status(401).send("Webhook error");
  }

  console.log(req.body);
  const { event, data } = req.body;

  if (event === "charge.success") {
    // change order status to OrderStatus.confirmed,

    const order = await Order.findByIdAndUpdate(data.reference, {
      orderStatus: OrderStatus.confirmed,
    });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // send an email
    const { email, firstname } = order.user;

    const SendEmail = new Email({ email, firstname });

    SendEmail.send(
      `Your order has been confirmed see details below: ${order.orderItems.forEach(
        (o) =>
          `<h3>${o.product.name}</h3> <img src=${o.product.image}/> <span>${o.product.price}</span>`
      )}

      <h2>TOTAL: ${order.grandTotal}</h2>
      `,

      "Order Confirmed"
    );

    return res.status(200).json({ status: "Order Confirmed and email has been sent" });
  } else {
    return res.status(500).json({
      status: "failed",
      message: "Event !== charge.completed Unable to complete transaction",
    });
  }
};
