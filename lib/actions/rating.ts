"use server";

import { db } from "@/drizzle";
import { rating } from "@/drizzle/schemas/rating";
import { ratingSelectSchema } from "@/zod-schemas/rating";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";
import z from "zod/v4";
import { authActionClient } from "../safe-action";

// Story Rating Actions

export const rateStoryAction = authActionClient
    .inputSchema(ratingSelectSchema)
    .action(async ({ parsedInput, ctx }) => {
        if (typeof parsedInput.id === "string" && parsedInput.id === "new") {
            // create new rating
            const [newRate] = await db
                .insert(rating)
                .values({
                    storyISBN: parsedInput.storyISBN,
                    stars: parsedInput.stars,
                    userId: ctx.user.id,
                })
                .returning();

            revalidatePath(`/story/${parsedInput.storyISBN}`);

            return newRate;
        } else {
            // update existing rating
            const [updateRate] = await db
                .update(rating)
                .set({
                    stars: parsedInput.stars,
                })
                .where(
                    and(
                        eq(rating.storyISBN, parsedInput.storyISBN),
                        eq(rating.userId, ctx.user.id)
                    )
                )
                .returning();

            revalidatePath(`/story/${parsedInput.storyISBN}`);

            return updateRate;
        }
    });

export const deleteStoryRating = authActionClient
    .inputSchema(
        z.object({
            storyISBN: z.string(),
            userId: z.string(),
        })
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
                    eq(rating.storyISBN, parsedInput.storyISBN)
                )
            )
            .returning();

        revalidatePath(`/story/${parsedInput.storyISBN}`);

        return deletedRating;
    });

export const getUserRating = async (
    userId: string | undefined,
    storyISBN: string
) => {
    if (!userId) return;

    try {
        const userRating = await db.query.rating.findFirst({
            where(fields, operators) {
                return operators.and(
                    operators.eq(fields.storyISBN, storyISBN),
                    operators.eq(fields.userId, userId)
                );
            },
            with: {
                comment: true,
            },
        });

        return userRating;
    } catch (e) {
        console.log(e);
    }
};
