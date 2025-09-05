"use server";

import { db } from "@/drizzle";
import { comment } from "@/drizzle/schemas/comment";
import {
    commentInsertSchema,
    commentUpdateSchema,
} from "@/zod-schemas/comment";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { unauthorized } from "next/navigation";
import z from "zod/v4";
import { authActionClient } from "../safe-action";

export const createCommentAction = authActionClient
    .inputSchema(commentInsertSchema)
    .action(async ({ parsedInput, ctx }) => {
        const [newComment] = await db
            .insert(comment)
            .values({
                userId: ctx.user.id,
                storyISBN: parsedInput.storyISBN,
                text: parsedInput.text.trim(),
                ...(parsedInput.ratingId
                    ? { ratingId: parsedInput.ratingId }
                    : {}),
                ...(parsedInput.parentCommentId
                    ? { parentCommentId: parsedInput.parentCommentId }
                    : {}),
                created: new Date(),
            })
            .returning();

        revalidatePath(`/story/${parsedInput.storyISBN}`);

        return newComment;
    });

export const updateCommentAction = authActionClient
    .inputSchema(
        z.object({
            commentId: z.number(),
            ...commentUpdateSchema.shape,
        })
    )
    .action(async ({ parsedInput, ctx }) => {
        if (ctx.user.id !== parsedInput.userId) throw unauthorized();

        // update the text
        const [updatedComment] = await db
            .update(comment)
            .set({
                text: parsedInput.text,
                hasBeenDeleted: false,
                edited: new Date(),
            })
            .where(
                and(
                    eq(comment.id, parsedInput.commentId),
                    eq(comment.storyISBN, parsedInput.storyISBN),
                    eq(comment.userId, parsedInput.userId)
                )
            )
            .returning();

        revalidatePath(`/story/${parsedInput.storyISBN}`);

        return updatedComment;
    });

export const deleteCommentAction = authActionClient
    .inputSchema(
        z.object({
            commentId: z.number(),
            userId: z.string(),
            storyISBN: z.string(),
        })
    )
    .action(async ({ parsedInput, ctx }) => {
        if (ctx.user.id !== parsedInput.userId) throw unauthorized();

        // delete comment by marking it as deleted, to preserve child comments
        const [deletedComment] = await db
            .update(comment)
            .set({
                hasBeenDeleted: true,
            })
            .where(
                and(
                    eq(comment.id, parsedInput.commentId),
                    eq(comment.userId, parsedInput.userId)
                )
            )
            .returning({ text: comment.text });

        revalidatePath(`/story/${parsedInput.storyISBN}`);

        return deletedComment;
    });

export const readStoryComments = async (isbn: string) => {
    try {
        const storyDb = await db.query.comment.findMany({
            where(fields, operators) {
                return operators.eq(fields.storyISBN, isbn);
            },
            with: {
                childComments: true,
                rating: true,
            },
            orderBy: (comments, { desc }) => [desc(comments.id)],
        });

        return storyDb;
    } catch (e) {
        console.log(e);
    }
};
