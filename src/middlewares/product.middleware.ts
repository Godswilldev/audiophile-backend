import "dotenv/config";
import sharp from "sharp";
import multer from "multer";
import { AppError } from "./handleAppError.middleware";
import { uploadToS3 } from "../utils/awsS3Client.utils";
import { Response, NextFunction, Request } from "express";

// MIDDLEWARE TO PASS FILTERS FOR GETTING THE TOP 5 PRODUCTS
export const aliasTopProducts = (req: Request, _res: Response, next: NextFunction) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.select = "name,price,ratingsAverage,features,description";
  next();
};

// multer- product image UPLOAD FUNCTION
const multerFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image, Please upload an Image File", 400));
  }
};

const upload = multer({ storage: multer.memoryStorage(), fileFilter: multerFilter });

export const uploadProductPhotos = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "productImageGallery", maxCount: 5 },
]);

const generateRandomNumber = (): number => Math.floor(Math.random() * 1000 + 1);

// IMAGE RESIZE AND UPLOAD MIDDLEWARE
export const resizeAndUploadProductPhotos = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  if (!files.image || !files.productImageGallery) {
    return next();
  }

  const Key = `products/product-${generateRandomNumber()}-cover`;

  const ContentType = files.image[0].mimetype;

  const Body = await sharp(files.image[0].buffer)
    .resize(2000, 1333)
    .toFormat("webp")
    .webp({ quality: 100 })
    .toBuffer();

  req.body.image = await uploadToS3({ Body, Key, ContentType });

  // uploading multiple files
  req.body.productImageGallery = [];

  await Promise.all(
    files.productImageGallery.map(async (file, index) => {
      const Key = `products/product-${generateRandomNumber()}-${index}-productImageGallery`;
      const ContentType = file.mimetype;

      // resize the image
      const Body = await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("webp")
        .webp({ quality: 100 })
        .toBuffer();

      // upload to s3
      const fileUrl = await uploadToS3({ Body, Key, ContentType });

      // save url to database
      req.body.productImageGallery.push(fileUrl);
    })
  );
  next();
};
