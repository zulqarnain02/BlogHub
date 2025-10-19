import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { db } from "../db";
import { posts, postsToCategories } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export const postsRouter = router({
  getAll: publicProcedure.query(() => {
    return db.query.posts.findMany({
      with: {
        postsToCategories: {
          with: {
            category: true,
          },
        },
      },
    });
  }),

  getPublished: publicProcedure.query(() => {
    return db.query.posts.findMany({
      where: eq(posts.status, "published"),
      with: {
        postsToCategories: {
          with: {
            category: true,
          },
        },
      },
    });
  }),

  // getById: publicProcedure.input(z.number()).query(({ input }) => {
  //   return db.query.posts.findFirst({
  //     where: eq(posts.id, input),
  //     with: {
  //       postsToCategories: {
  //         with: {
  //           category: true,
  //         },
  //       },
  //     },
  //   });
  // }),

  getBySlug: publicProcedure.input(z.string()).query(({ input }) => {
    return db.query.posts.findFirst({
      where: eq(posts.slug, input),
      with: {
        postsToCategories: {
          with: {
            category: true,
          },
        },
      },
    });
  }),

  // getByCategory: publicProcedure.input(z.number()).query(({ input }) => {
  //   const sq = db
  //     .select({ postId: postsToCategories.postId })
  //     .from(postsToCategories)
  //     .where(eq(postsToCategories.categoryId, input))
  //     .as("sq");

  //   return db
  //     .select()
  //     .from(posts)
  //     .innerJoin(sq, eq(posts.id, sq.postId));
  // }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        excerpt: z.string().min(1),
        status: z.enum(["draft", "published"]).default("draft"),
        categories: z.array(z.number()).default([]),
      }),
    )
    .mutation(async ({ input }) => {
      const slug = input.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      const [newPost] = await db
        .insert(posts)
        .values({ ...input, slug })
        .returning();

      if (input.categories.length > 0) {
        await db.insert(postsToCategories).values(
          input.categories.map((catId) => ({
            postId: newPost.id,
            categoryId: catId,
          })),
        );
      }

      return newPost;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        status: z.enum(["draft", "published"]).optional(),
        categories: z.array(z.number()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, categories: categoryIds, ...data } = input;
      const [updatedPost] = await db
        .update(posts)
        .set({
          ...data,
          ...(data.title && {
            slug: data.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, "")
              .replace(/\s+/g, "-"),
          }),
        })
        .where(eq(posts.id, id))
        .returning();

      if (categoryIds) {
        // Delete existing relations
        await db
          .delete(postsToCategories)
          .where(eq(postsToCategories.postId, id));
        // Insert new relations
        if (categoryIds.length > 0) {
          await db.insert(postsToCategories).values(
            categoryIds.map((catId) => ({
              postId: id,
              categoryId: catId,
            })),
          );
        }
      }
      return updatedPost;
    }),

  delete: publicProcedure.input(z.number()).mutation(async ({ input }) => {
    // delete relations first
    await db
      .delete(postsToCategories)
      .where(eq(postsToCategories.postId, input));
    // then delete post
    return db.delete(posts).where(eq(posts.id, input));
  }),
});
