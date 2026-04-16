"use server";

import { db } from "@/drizzle";
import { rating } from "@/drizzle/schemas/rating";
import { ratingSelectSchema } from "@/zod-schemas/rating";
import { and, eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { unauthorized } from "next/navigation";
import z from "zod/v4";
import { authActionClient } from "../safe-action";

// Story Rating Actions

export const rateStoryAction = authActionClient
    .inputSchema(ratingSelectSchema)
    .action(async ({ parsedInput, ctx }) => {
        const userId = ctx.user.id;

        // Use an upsert-like logic based on the Unique constraint (userId + storyISBN)
        // This prevents the "updating a deleted record" issue
        const [existing] = await db
            .select()
            .from(rating)
            .where(
                and(
                    eq(rating.storyISBN, parsedInput.storyISBN),
                    eq(rating.userId, userId),
                ),
            );

        if (!existing) {
            const [newRate] = await db
                .insert(rating)
                .values({
                    storyISBN: parsedInput.storyISBN,
                    stars: parsedInput.stars,
                    userId: userId,
                })
                .returning();
            return newRate;
        } else {
            const [updatedRate] = await db
                .update(rating)
                .set({ stars: parsedInput.stars })
                .where(eq(rating.id, existing.id))
                .returning();
            return updatedRate;
        }
    });

export const deleteStoryRating = authActionClient
    .inputSchema(
        z.object({
            storyISBN: z.string(),
            userId: z.string(),
        }),
    )
    .action(async ({ parsedInput, ctx }) => {
        if (ctx.user.id !== parsedInput.userId) {
            unauthorized();
        }
        const [deletedRating] = await db
            .delete(rating)
            .where(
                and(
                    eq(rating.userId, ctx.user.id),
                    eq(rating.storyISBN, parsedInput.storyISBN),
                ),
            )
            .returning();

        updateTag(`readStoryComments-${parsedInput.storyISBN}`); // change to only when a comment is sure

        return deletedRating;
    });

export const getUserRating = async (userId: string, storyISBN: string) => {
    try {
        const userRating = await db.query.rating.findFirst({
            where(fields, operators) {
                return operators.and(
                    operators.eq(fields.storyISBN, storyISBN),
                    operators.eq(fields.userId, userId),
                );
            },
            with: {
                comment: true,
            },
        });

        return userRating;
    } catch (e) {
        console.log(e);
        throw new Error("Failed to fetch user rating");
    }
};

export const getStoryRatings = async (storyISBN: string) => {
    try {
        const userRating = await db.query.rating.findMany({
            where(fields, operators) {
                return operators.and(operators.eq(fields.storyISBN, storyISBN));
            },
        });

        return userRating;
    } catch (e) {
        console.log(e);
        throw new Error("Failed to fetch story ratings");
    }
};
