import { Request, Response } from "express";
import Reviews from "../models/reviews.model";
import { deleteHandler, getOneHandler } from "../middlewares/handlerFactory.controller";

// GET ALL REVIEWS
export const getAllReviews = async (req: Request, res: Response) => {
  let filter = {};
  if (req.params.id) {
    filter = { product: req.params.id };
  }
  const reviews = await Reviews.find(filter);
  return res.status(200).json({ status: "success", results: reviews.length, data: { reviews } });
};

// CREATE REVIEW
export const createReview = async (req: Request, res: Response) => {
  if (!req.body.productId) {
    req.body.productId = req.params.product_id;
  }
  const { review, rating, productId } = req.body;

  const newReview = await Reviews.create({ review, rating, user: req.user.id, productId });
  res.status(201).json({ status: "Review Added Successfully", data: { review: newReview } });
};

export const getOneReview = getOneHandler(Reviews);
export const deleteReview = deleteHandler(Reviews);
// export const updateReview = updateHandler(Reviews);
