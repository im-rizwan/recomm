import slugify from "@/lib/slugify";
import { z } from "zod";
import { idSchema } from "@/utils/validation";
import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";
import { AccessType } from "@prisma/client";
import {
  defaultLimit,
  defaultSortBy,
  defaultSortOrder,
  maxLimit,
} from "@/utils/constants";
import { BrandPayload, states } from "@/types/prisma";

export const brandRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        sortBy: z
          .enum(["name", "createdAt", "updatedAt", "active"])
          .default(defaultSortBy),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        state: z.enum(states),
      }),
    )
    .query(
      async ({
        input: { limit, search, sortBy, sortOrder, categoryId, cursor, state },
        ctx: { prisma, isAdminPage },
      }) => {
        const brands = await prisma.brand.findMany({
          where: {
            name: {
              contains: search,
            },
            models: categoryId
              ? {
                  some: {
                    category: {
                      id: categoryId,
                      active: isAdminPage ? undefined : true,
                    },
                  },
                }
              : undefined,
            active: isAdminPage ? undefined : true,
            createdState: state,
          },
          take: limit,
          skip: cursor ? 1 : undefined,
          cursor: cursor
            ? {
                id: cursor,
              }
            : undefined,
          orderBy: [
            {
              [sortBy]: sortOrder,
            },
          ],
        });

        return {
          brands,
          nextCursor: brands[limit - 1]?.id,
        };
      },
    ),

  byId: publicProcedure
    .input(z.object({ brandId: idSchema }))
    .query(async ({ input: { brandId: id }, ctx: { prisma } }) => {
      const brand = await prisma.brand.findUnique({
        where: {
          id,
        },
        include: BrandPayload.include,
      });
      if (brand === null) {
        return "Brand not found";
      }
      return brand;
    }),

  create: getProcedure(AccessType.createBrand)
    .input(
      z.object({
        name: z.string(),
        state: z.enum(states),
      }),
    )
    .mutation(async ({ input: { name, state }, ctx: { prisma, session } }) => {
      // checking whether the brand exists
      const existingBrand = await prisma.brand.findFirst({
        where: {
          name,
          createdState: state,
        },
      });
      if (existingBrand !== null) {
        return "Brand already exists";
      }
      // creating the brand
      const brand = await prisma.brand.create({
        data: {
          name,
          slug: slugify(name),
          createdState: state,
          createdBy: {
            connect: {
              id: session.user.id,
            },
          },
        },
      });
      return brand;
    }),
  update: getProcedure(AccessType.updateBrand)
    .input(
      z.union([
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255),
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          active: z.boolean(),
        }),
      ]),
    )
    .mutation(
      async ({ input: { id, name: newName, active }, ctx: { prisma } }) => {
        // checking whether the brand exists
        const existingBrand = await prisma.brand.findUnique({
          where: {
            id,
          },
          select: {
            name: true,
            createdState: true,
          },
        });
        if (existingBrand === null) {
          return "Brand not found";
        }
        // checking whether the new brand name already exists
        if (newName !== undefined && newName !== existingBrand.name) {
          const existingName = await prisma.brand.findFirst({
            where: {
              name: {
                equals: newName,
              },
              createdState: existingBrand.createdState,
            },
            select: {
              id: true,
            },
          });
          if (existingName !== null) {
            return "Brand already exists";
          }
        }
        const brand = await prisma.brand.update({
          where: {
            id,
          },
          data: {
            name: newName,
            slug: newName ? slugify(newName) : undefined,
            active,
          },
        });

        return brand;
      },
    ),
  delete: getProcedure(AccessType.deleteBrand)
    .input(z.object({ brandId: idSchema }))
    .mutation(async ({ input: { brandId: id }, ctx: { prisma } }) => {
      const existingBrand = await prisma.brand.findUnique({
        where: {
          id,
        },
      });
      if (existingBrand === null) {
        return "Brand not found";
      }
      const brand = await prisma.brand.delete({
        where: {
          id,
        },
      });

      return brand;
    }),
});
