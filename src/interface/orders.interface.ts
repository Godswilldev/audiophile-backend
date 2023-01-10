/* eslint-disable no-unused-vars */
import { Model } from "mongoose";

export enum OrderStatus {
  placed = "placed",
  cancelled = "cancelled",
  confirmed = "confirmed",
  shipped = "shipped",
  delivered = "delivered",
}

export interface OrderProps {
  orderItems: [
    {
      product: { id: string; slug: string; name: string; price: number; image: string };
      quantity: number;
    }
  ];

  user: { firstname: string; lastname: string; id: string; photo: string; email: string };
  shippingInfo: { address: string; city: string; country: string; zipCode: string };

  orderedAt: Date;
  orderStatus: OrderStatus;
  deliveredAt: Date;

  shippingFee: number;
  productsTotal: number;
  vat: number;
  grandTotal: number;
}

export interface OrderInstanceMethods {
  updateSummary(): void;
}

export interface OrderModel extends Model<OrderProps, {}, OrderInstanceMethods> {
  calcOrderItemsTotal: (productId: string) => Promise<OrderProps>;
}
