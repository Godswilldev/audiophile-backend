import { Router } from "express";
import reviewsRouter from "./review.route";
import { roles } from "../interface/user.interface";
import { protect, restrictTo } from "../middlewares/auth.middleware";
import { catchAsync } from "../middlewares/catchAsyncError.middleware";
import { getProductInACategory } from "../controllers/product.controller";
import {
  aliasTopProducts,
  uploadProductPhotos,
  resizeAndUploadProductPhotos,
} from "../middlewares/product.middleware";
import {
  createProduct,
  getOneProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductStats,
} from "../controllers/product.controller";

const productsRouter = Router();

// get reviews on a particular product
productsRouter.use("/:product_id/reviews", reviewsRouter);

// Get product stats (can be used for the admin dashboard)
productsRouter
  .route("/admin/product-stats")
  .get(catchAsync(protect), restrictTo([roles.admin, roles.manager]), catchAsync(getProductStats));

// GET TOP MOST EXPENSIVE PRODUCTS  (can be used for the admin dashboard)
productsRouter
  .route("/admin/top-5-products")
  .get(
    catchAsync(protect),
    restrictTo([roles.admin, roles.manager]),
    aliasTopProducts,
    catchAsync(getAllProducts)
  );

// GET AND CREATE NEW PRODUCTS
productsRouter
  .route("/")
  // Get all products with queries (queries include select,sort, limit, skip )
  .get(catchAsync(getAllProducts))
  // create product, only admins and manager allowed
  .post(
    catchAsync(protect),
    restrictTo([roles.admin, roles.manager]),
    uploadProductPhotos,
    catchAsync(resizeAndUploadProductPhotos),
    catchAsync(createProduct)
  );

productsRouter.route("/category/:category").get(catchAsync(getProductInACategory));

// GET ONE, UPDATE AND DELETE PRODUCT
productsRouter
  .route("/:id")
  .get(catchAsync(getOneProduct))
  //  Managers and Admins only
  .patch(
    catchAsync(protect),
    restrictTo([roles.admin, roles.manager]),
    uploadProductPhotos,
    catchAsync(resizeAndUploadProductPhotos),
    catchAsync(updateProduct)
  )
  .delete(catchAsync(protect), restrictTo([roles.admin, roles.manager]), catchAsync(deleteProduct));

export default productsRouter;
