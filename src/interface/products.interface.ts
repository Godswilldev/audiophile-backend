/* eslint-disable no-unused-vars */

export enum productsCategories {
  headphones = "headphones",
  earphones = "earphones",
  speakers = "speakers",
}

export interface ProductProps {
  slug: string;
  new: Boolean;
  name: string;
  price: number;
  quantityInStock: number;
  inStock: Boolean;
  image: string;
  description: string;
  features: string;
  productImageGallery: [string];
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: Date;
  category: productsCategories;
  includedItems: [{ quantity: number; item: string }];
  reviews: [];
}
