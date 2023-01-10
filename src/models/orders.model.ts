/* eslint-disable no-invalid-this */
import { Schema, model, SchemaTypes } from "mongoose";
import {
  OrderProps,
  OrderModel,
  OrderInstanceMethods,
  OrderStatus,
} from "../interface/orders.interface";

// ORDER SCHEMA
const ordersSchema = new Schema<OrderProps, OrderModel, OrderInstanceMethods>(
  {
    orderItems: [
      {
        _id: false,
        product: {
          type: SchemaTypes.ObjectId,
          ref: "Product",
          required: [true, "An order must have at least one product"],
        },
        quantity: { type: Number, default: 1 },
      },
    ],

    user: {
      type: SchemaTypes.ObjectId,
      ref: "User",
      required: [true, "orders must belong to a user"],
    },

    shippingInfo: {
      address: { type: String, required: [true, "order must have a shipping address"], trim: true },
      city: { type: String, required: [true, "order must have a shipping city"], trim: true },
      country: { type: String, required: [true, "order must have a shipping country"], trim: true },
      zipCode: { type: String },
    },

    orderedAt: { type: Date, default: Date.now },

    orderStatus: {
      type: String,
      enum: [
        OrderStatus.placed,
        OrderStatus.cancelled,
        OrderStatus.confirmed,
        OrderStatus.shipped,
        OrderStatus.delivered,
      ],
      default: OrderStatus.placed,
    },
    deliveredAt: { type: Date },

    shippingFee: { type: Number },
    productsTotal: { type: Number },
    vat: { type: Number },
    grandTotal: { type: Number },
  },
  { versionKey: false }
);

//  MONGOOSE MIDDLEWARES
ordersSchema.pre("save", async function () {
  const greg = await this.populate({
    path: "orderItems.product",
    select: "slug name price image",
  });

  const total = greg.orderItems.reduce(
    (acc: number, next: { quantity: number; product: { price: number } }) =>
      (acc += next.quantity * next.product.price),
    0
  );
  this.productsTotal = total;

  this.shippingFee = this.orderItems.reduce(
    (acc, next, _, array) =>
      Math.round(((acc += next.quantity * next.product.price) * array.length) / 100),
    0
  );

  this.vat = this.orderItems.reduce(
    (acc: number, next: { quantity: number; product: { price: number } }) =>
      Math.round((acc += next.quantity * next.product.price) * 0.01),
    0
  );
  this.grandTotal = parseInt((this.shippingFee + total + this.vat).toFixed(0));
});

ordersSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstname lastname id photo email",
  });
  next();
});

ordersSchema.pre(/^find/, function (next) {
  this.populate({
    path: "orderItems.product",
    select: "slug name price image",
  });
  next();
});

const Order = model<OrderProps, OrderModel>("Order", ordersSchema);

export default Order;
