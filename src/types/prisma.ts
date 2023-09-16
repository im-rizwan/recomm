import {
  Bid,
  Brand,
  Category,
  Image,
  Model as PrismaModel,
  Product as PrismaProduct,
  User,
} from "@prisma/client";

export type Product = PrismaProduct & {
  model: PrismaModel & {
    brand: Brand;
    categories: Category[];
  };
  room?: {
    bids: (Bid & {
      user: User;
    })[];
  };
};

export type Model = PrismaModel & {
  brand: Brand & {
    image: Image | null;
  };
  category: Category & {
    image: Image | null;
  };
  image: Image | null;
};