import { z } from "zod";

import { functionalityOptions } from "@/utils/validation";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const searchRouter = createTRPCRouter({
  all: publicProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { search, page, limit, sortBy, sortOrder }, ctx }) => {
        if (search.trim() === "") {
          return {
            categories: [],
            brands: [],
            models: [],
          };
        }
        try {
          const categories = await ctx.prisma.category.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });

          const brands = await ctx.prisma.brand.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            skip: limit * (page - 1),
            take: limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });

          const models = await ctx.prisma.model.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            take: limit,
            skip: (page - 1) * limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });

          return {
            categories,
            brands,
            models,
          };
        } catch (error) {
          console.error({ procedure: "search.all", error });
          return new Error("Something went wrong!");
        }
      }
    ),
  category: publicProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { search, page, limit, sortBy, sortOrder }, ctx }) => {
        try {
          const categories = await ctx.prisma.category.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });
          return categories;
        } catch (error) {
          console.error({ procedure: "search.category", error });
          return new Error("Something went wrong!");
        }
      }
    ),

  brands: publicProcedure
    .input(
      functionalityOptions.extend({
        categoryId: z.string().cuid().optional(),
      })
    )
    .query(
      async ({
        input: { limit, page, search, sortBy, sortOrder, categoryId },
        ctx,
      }) => {
        try {
          const brands = await ctx.prisma.brand.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
              models: categoryId
                ? {
                    some: {
                      categoryId,
                    },
                  }
                : undefined,
            },
            skip: limit * (page - 1),
            take: limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });
          return brands;
        } catch (error) {
          console.error({ procedure: "search.brands", error });

          return new Error("Something went wrong!");
        }
      }
    ),

  models: publicProcedure
    .input(
      functionalityOptions.extend({
        categoryId: z.string().cuid().optional(),
        brandId: z.string().cuid().optional(),
      })
    )
    .query(
      async ({
        input: { limit, page, search, sortBy, sortOrder, brandId, categoryId },
        ctx,
      }) => {
        try {
          const models = await ctx.prisma.model.findMany({
            where: {
              brandId,
              category: categoryId
                ? {
                    id: categoryId,
                  }
                : undefined,
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            take: limit,
            skip: (page - 1) * limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });
          return models;
        } catch (error) {
          console.error({
            procedure: "search.models",
            error,
          });
          return new Error("Something went wrong!");
        }
      }
    ),
});
