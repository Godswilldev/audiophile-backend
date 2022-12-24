/* eslint-disable no-invalid-this */
import { Schema, model, SchemaTypes } from "mongoose";
import { ReviewProps, ReviewInstanceMethods, ReviewsModel } from "../interface/review.interface";
import Product from "./product.model";

const reviewSchema = new Schema<ReviewProps, ReviewsModel, ReviewInstanceMethods>(
  {
    reviewTitle: {
      type: String,
      trim: true,
      required: [true, "A review Title cannot be empty"],
    },
    reviewDescription: {
      type: String,
      trim: true,
      required: [true, "A review Description cannot be empty"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
      default: 4.5,
    },
    productId: {
      type: SchemaTypes.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },
    user: {
      type: SchemaTypes.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  { versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// prevent duplicate reviews
reviewSchema.index({ productId: 1, user: 1 }, { unique: true });

// populate the user path with the firstname, lastname and photo on the review model
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "firstname lastname photo",
  });
  next();
});

// static method to aggregate the average reviews and number of reviews
reviewSchema.statics.calcAverageratings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { productId },
    },
    {
      $group: {
        _id: "$productId",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // update the product to reflect the calculated average review
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

// call the calculated average rating func after the review is saved
reviewSchema.post("save", function (doc) {
  doc.constructor.calcAverageratings(this.productId);
});

const Reviews = model<ReviewProps, ReviewsModel>("Reviews", reviewSchema);

export default Reviews;
