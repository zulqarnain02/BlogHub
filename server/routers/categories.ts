import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { db } from "../db";
import { categories, postsToCategories } from "../db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const categoriesRouter = router({
  getAll: publicProcedure.query(() => {
    console.log("getAll categories")
    return db.query.categories.findMany();
  }),

  // getById: publicProcedure.input(z.number()).query(({ input }) => {
  //   return db.query.categories.findFirst({
  //     where: eq(categories.id, input),
  //   });
  // }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const slug = input.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      const [newCategory] = await db.insert(categories).values({
        name: input.name,
        slug,
        description: input.description,
      }).returning();
      return newCategory;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;

      const setData: Record<string, unknown> = { ...data };

      if (data.name) {
        setData.slug = data.name
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
      }

      return db.update(categories).set(setData).where(eq(categories.id, id));
    }),

  delete: publicProcedure.input(z.number()).mutation(async ({ input }) => {
    const postAssociations = await db.query.postsToCategories.findMany({
      where: eq(postsToCategories.categoryId, input),
    });

    if (postAssociations.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message:
          "This category is associated with existing posts and cannot be deleted.",
      });
    }

    return db.delete(categories).where(eq(categories.id, input));
  }),
});
