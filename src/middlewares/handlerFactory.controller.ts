/* eslint-disable indent */
import { NextFunction, Request, Response } from "express";
import { AppError } from "./handleAppError.middleware";
import Reviews from "../models/reviews.model";
import Product from "../models/product.model";
import User from "../models/user.model";
import Order from "../models/orders.model";

// CUSTOM DELETE HANDLER FUNCTION
export const deleteHandler =
  (Model: typeof Reviews | typeof Product | typeof User | typeof Order) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError("No document found with that id", 404));
    }
    return res.status(204).json({ status: "Deleted Successfully", data: null });
  };

// CUSTOM CREATE HANDLER FUNCTION
export const createHandler =
  (Model: typeof Reviews | typeof Product | typeof User) => async (req: Request, res: Response) => {
    const newP = await Model.create(req.body);
    return res.status(201).json({ status: "Created Successfully", data: { data: newP } });
  };

// CUSTOM UPDATE HANDLER FUNCTION
export const updateHandler =
  (Model: any) => async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that id", 404));
    }
    return res.status(201).json({ status: "Updated Successfully", data: { data: doc } });
  };

// CUSTOM GET HANDLER FUNCTION
export const getOneHandler =
  (Model: any, populateOptions?: { path: string; select?: string }) =>
  async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that id", 404));
    }

    return res.status(200).json({ status: "success", data: { data: doc } });
  };
