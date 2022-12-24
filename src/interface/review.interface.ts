import { Model } from "mongoose";

export interface ReviewProps {
  reviewTitle: string;
  reviewDescription: string;
  rating: number;
  createdAt: Date;
  productId: string;
  user: string;
}

export interface ReviewInstanceMethods {}

export interface ReviewsModel extends Model<ReviewProps, {}, ReviewInstanceMethods> {
  calcAverageratings: (productId: string) => Promise<ReviewProps>;
}
