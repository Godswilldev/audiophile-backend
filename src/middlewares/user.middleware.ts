import multer from "multer";
import { Request, NextFunction, Response } from "express";
import { AppError } from "./handleAppError.middleware";
import sharp from "sharp";
import { uploadToS3 } from "../utils/awsS3Client.utils";

// const multerStorage = multer.diskStorage({
//   destination: (req: Request, file: Express.Multer.File, cb) => {
//     cb(null, "images/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// multer user photo upload function
const multerFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image, Please upload an Image File", 400));
  }
};

const upload = multer({ storage: multer.memoryStorage(), fileFilter: multerFilter });

export const uploadUserPhoto = upload.single("photo");

// resize user photo
export const resizeUserPhoto = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  const Key = `users/user-${req.user.id}`;

  const ContentType = req.file.mimetype;

  const Body = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("webp")
    .webp({ quality: 100 })
    .toBuffer();

  req.file.filename = await uploadToS3({ Body, Key, ContentType });

  next();
};
