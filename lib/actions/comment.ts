"use server";

import { db } from "@/drizzle";
import { comment } from "@/drizzle/schemas/comment";
import { reaction } from "@/drizzle/schemas/reaction";
import { FlattenedCommentIdsType } from "@/types/comment";
import { UserSelectType } from "@/types/user";
import {
    commentInsertSchema,
    commentUpdateSchema,
} from "@/zod-schemas/comment";
import { reactionInsertSchema } from "@/zod-schemas/reaction";
import { and, eq } from "drizzle-orm";
import { cacheTag, revalidatePath, updateTag } from "next/cache";
import z from "zod/v4";
import {
    canCreateComment,
    canDeleteAllComment,
    canDeleteOwnComment,
    canUpdateComment,
} from "../auth/policies";
import { authActionClient } from "../safe-action";
import { batchCalculateCommentPermissions } from "../utils/comment/calculate-comment-permissions";

export const createCommentAction = authActionClient
    .inputSchema(commentInsertSchema)
    .action(async ({ parsedInput, ctx }) => {
        const canCreate = await canCreateComment();

        if (!canCreate) {
            throw new Error("You Cannot Make Comments!");
        }

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

        updateTag(`readStoryComments-${parsedInput.storyISBN}`);
        revalidatePath(`/story/${parsedInput.storyISBN}`);

        return newComment;
    });

export const updateCommentAction = authActionClient
    .inputSchema(
        z.object({
            commentId: z.number(),
            ...commentUpdateSchema.shape,
        }),
    )
    .action(async ({ parsedInput, ctx }) => {
        const canUpdate = await canUpdateComment(
            ctx.user as UserSelectType,
            parsedInput,
        );

        if (!canUpdate) {
            throw new Error("You Cannot Edit This Comment!");
        }

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
                    eq(comment.userId, parsedInput.userId),
                ),
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
        }),
    )
    .action(async ({ parsedInput, ctx }) => {
        const [canDeleteOwn, canDeleteAll] = await Promise.all([
            await canDeleteOwnComment(ctx.user as UserSelectType, parsedInput),
            await canDeleteAllComment(parsedInput),
        ]);

        if (!canDeleteOwn && !canDeleteAll) {
            throw new Error("You Are Not Authorized To Delete This Comment!");
        }

        // delete comment by marking it as deleted, to preserve child comments
        const [deletedComment] = await db
            .update(comment)
            .set({
                hasBeenDeleted: true,
            })
            .where(
                and(
                    eq(comment.id, parsedInput.commentId),
                    eq(comment.userId, parsedInput.userId),
                ),
            )
            .returning({ text: comment.text });

        revalidatePath(`/story/${parsedInput.storyISBN}`);

        return deletedComment;
    });

export const readStoryComments = async (isbn: string) => {
    "use cache";
    cacheTag(`readStoryComments-${isbn}`);

    try {
        // Get all comments first
        const comments = await db.query.comment.findMany({
            where(fields, operators) {
                return operators.eq(fields.storyISBN, isbn);
            },
            with: {
                childComments: true,
                rating: true,
                user: true,
                reactions: true,
            },
            orderBy: (comments, { desc }) => [desc(comments.id)],
        });

        return comments;
    } catch (e) {
        console.log(e);
        throw new Error("Failed to load comments");
    }
};

export const likeCommentAction = authActionClient
    .inputSchema(reactionInsertSchema)
    .action(async ({ parsedInput }) => {
        const existingReaction = await db.query.reaction.findFirst({
            where(fields, operators) {
                return operators.and(
                    operators.eq(fields.commentId, parsedInput.commentId),
                    operators.eq(fields.userId, parsedInput.userId),
                );
            },
        });

        if (!existingReaction) {
            await db
                .insert(reaction)
                .values({
                    liked: true,
                    disliked: false,
                    commentId: parsedInput.commentId,
                    userId: parsedInput.userId,
                })
                .returning();

            return { liked: true };
        }

        // if existing, check if disliked or liked
        // (delete if already liked, else swap)

        if (existingReaction.liked) {
            await db
                .delete(reaction)
                .where(
                    and(
                        eq(reaction.commentId, existingReaction.commentId),
                        eq(reaction.userId, existingReaction.userId),
                        eq(reaction.id, existingReaction.id),
                    ),
                );

            return { deleted: true };
        }

        // else swap

        await db
            .update(reaction)
            .set({
                liked: true,
                disliked: false,
            })
            .where(
                and(
                    eq(reaction.commentId, existingReaction.commentId),
                    eq(reaction.userId, existingReaction.userId),
                    eq(reaction.id, existingReaction.id),
                ),
            );

        return { liked: true };
    });

export const dislikeCommentAction = authActionClient
    .inputSchema(reactionInsertSchema)
    .action(async ({ parsedInput }) => {
        const existingReaction = await db.query.reaction.findFirst({
            where(fields, operators) {
                return operators.and(
                    operators.eq(fields.commentId, parsedInput.commentId),
                    operators.eq(fields.userId, parsedInput.userId),
                );
            },
        });

        if (!existingReaction) {
            await db
                .insert(reaction)
                .values({
                    liked: false,
                    disliked: true,
                    commentId: parsedInput.commentId,
                    userId: parsedInput.userId,
                })
                .returning({ disliked: reaction.disliked });

            return { disliked: true };
        }

        // if existing, check if disliked or liked
        // (delete if already disliked, else swap)

        if (existingReaction.disliked) {
            await db
                .delete(reaction)
                .where(
                    and(
                        eq(reaction.commentId, existingReaction.commentId),
                        eq(reaction.userId, existingReaction.userId),
                        eq(reaction.id, existingReaction.id),
                    ),
                );

            return { deleted: true };
        }

        // else swap

        await db
            .update(reaction)
            .set({
                liked: false,
                disliked: true,
            })
            .where(
                and(
                    eq(reaction.commentId, existingReaction.commentId),
                    eq(reaction.userId, existingReaction.userId),
                    eq(reaction.id, existingReaction.id),
                ),
            );

        return { disliked: true };
    });

export const deleteCommentThreadAction = authActionClient
    .inputSchema(
        z.object({
            commentId: z.number(),
            userId: z.string(),
            storyISBN: z.string(),
        }),
    )
    .action(async ({ parsedInput }) => {
        const canDelete = await canDeleteAllComment(parsedInput);

        if (!canDelete) {
            throw new Error("You Are Not Authorized To Delete This Comment!");
        }

        // delete comment which in turn will delete all comment that has it as a parent
        const [deletedComment] = await db
            .delete(comment)
            .where(
                and(
                    eq(comment.id, parsedInput.commentId),
                    eq(comment.userId, parsedInput.userId),
                ),
            )
            .returning({ text: comment.text });

        revalidatePath(`/story/${parsedInput.storyISBN}`);

        return deletedComment;
    });

export const getCommentsPermmissions = async ({
    comments,
    user,
}: {
    comments: FlattenedCommentIdsType[];
    user: UserSelectType | undefined;
}) => {
    // Calculate permissions for ALL comments in one batch
    const permissionsMap = await batchCalculateCommentPermissions(
        user,
        comments,
    );

    return permissionsMap;
};
