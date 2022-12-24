import { NextFunction, Request, Response } from "express";

// FUNCTION TO CATCH ASYNC ERRORS
export const catchAsync = (fn: any) => (req: Request, res: Response, next: NextFunction) =>
  fn(req, res, next).catch(next);
