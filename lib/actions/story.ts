"use server";

import { db } from "@/drizzle";
import { comment, rating, story } from "@/drizzle/schemas/story";
import {
    commentInsertSchema,
    commentUpdateSchema,
    ratingSelectSchema,
    storyInsertSchema,
    storyUpdateSchema,
} from "@/zod-schemas/story";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { authActionClient } from "../safe-action";
import { handleFileUpload } from "../utils/image-upload";

import z from "zod/v4";

import { revalidatePath } from "next/cache";
import { redirect, unauthorized } from "next/navigation";
import { sanitizeHTML } from "../utils/sanitize-html";

export const createStoryAction = authActionClient
    .inputSchema(storyInsertSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(async ({ parsedInput: inputData, ctx }) => {
        // insert new story

        const [createdStory] = await db
            .insert(story)
            .values({
                authorId: ctx.user.id,
                title: inputData.title,
                subtitle: inputData.subtitle,
                content: sanitizeHTML(inputData.content),
            })
            .returning({
                isbn: story.isbn,
                title: story.title,
                image: story.image,
            });

        // upload image using isbn as public id
        let imageUrl: string | undefined = undefined;

        if (inputData.image && inputData.image.length > 0) {
            const uploadResponse = await handleFileUpload(
                inputData.image[0],
                createdStory.isbn,
                {
                    throwOnError: true,
                }
            );
            imageUrl = uploadResponse?.secure_url;

            // insert image url
            await db
                .update(story)
                .set({
                    image: imageUrl,
                })
                .where(eq(story.isbn, createdStory.isbn));
        }

        // add image url
        if (imageUrl) {
            createdStory.image = imageUrl;
        }

        revalidatePath(`/`);

        return createdStory;
    });

export const updateStoryAction = authActionClient
    .inputSchema(storyUpdateSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .bindArgsSchemas<[isbn: z.ZodUUID, authorId: z.ZodString]>([
        z.uuid(),
        z.string(),
    ])
    .action(
        async ({
            parsedInput: updateData,
            bindArgsParsedInputs: [isbn, authorId],
            ctx,
        }) => {
            if (ctx.user.id !== authorId) {
                unauthorized();
            }

            let imageUrl: string | undefined = undefined;

            if (updateData.image.length > 0) {
                const uploadResponse = await handleFileUpload(
                    updateData.image[0], //upload the last image
                    isbn, // overwrite this publicId
                    {
                        throwOnError: true,
                    }
                );
                imageUrl = uploadResponse?.secure_url;
            }

            const [updatedStory] = await db
                .update(story)
                .set({
                    ...(!!updateData.title?.trim() && {
                        title: updateData.title,
                    }),

                    ...(!!updateData.content?.trim() && {
                        content: sanitizeHTML(updateData.content),
                    }),

                    ...(!!updateData.bookId && { bookId: updateData.bookId }),

                    ...(!!imageUrl && { image: imageUrl }),

                    subtitle: updateData.subtitle,

                    edited: new Date(),
                })
                .where(eq(story.isbn, isbn))
                .returning();

            revalidatePath(`/story/${updatedStory.isbn}`);
            revalidatePath("/");

            return updatedStory;
        }
    );

export const readStory = async (isbn: string) => {
    try {
        const storyDb = await db.query.story.findFirst({
            where(fields, operators) {
                return operators.eq(fields.isbn, isbn);
            },
            with: {
                author: true,
                ratings: true,
            },
        });
        return storyDb;
    } catch (e) {
        console.log(e);
    }
};

export const readLatestStories = async (latest: number = 10) => {
    try {
        const latestStories = await db.query.story.findMany({
            limit: latest,
            orderBy: (stories, { desc }) => [desc(stories.created)],
            with: {
                author: true,
            },
        });
        return latestStories;
    } catch (e) {
        console.log(e);
    }
};

export const deleteStoryAction = authActionClient
    .inputSchema(
        z.object({
            isbn: z.uuid(),
        })
    )
    .bindArgsSchemas<[authorId: z.ZodString]>([z.string()])
    .action(
        async ({
            ctx,
            parsedInput: { isbn },
            bindArgsParsedInputs: [authorId],
        }) => {
            if (ctx.user.id !== authorId) {
                throw unauthorized();
            }

            const [deletedStory] = await db
                .delete(story)
                .where(
                    and(eq(story.isbn, isbn), eq(story.authorId, ctx.user.id))
                )
                .returning({ title: story.title });

            if (!deletedStory?.title) {
                revalidatePath("/");
                throw redirect("/");
            }

            revalidatePath(`/story`, "layout");
            revalidatePath("/");

            return deletedStory;
        }
    );

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

        // delete comment if update contains no text content
        const [deletedComment] = await db
            .delete(comment)
            .where(
                and(
                    eq(comment.id, parsedInput.commentId),
                    eq(comment.userId, parsedInput.userId)
                )
            )
            .returning({ text: comment.text });

        if (!deletedComment) {
            throw new Error("Comment No Longer Exists");
        }

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
            },
            orderBy: (comments, { desc }) => [desc(comments.id)],
        });

        return storyDb;
    } catch (e) {
        console.log(e);
    }
};
