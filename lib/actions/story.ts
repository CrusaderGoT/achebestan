"use server";

import { db } from "@/drizzle";
import { story } from "@/drizzle/schemas/story";
import { storyInsertSchema, storyUpdateSchema } from "@/zod-schemas/story";
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

        revalidatePath(`/story`);

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
                throw unauthorized();
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

            revalidatePath(`/story`);
            revalidatePath(`/story/${updatedStory.isbn}`);

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

const deleteStorySchema = z.object({
    isbn: z.uuid(),
});

export const deleteStory = authActionClient
    .inputSchema(deleteStorySchema)
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
                throw redirect("/");
            }

            revalidatePath("/story");

            return deletedStory;
        }
    );
