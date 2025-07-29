"use server";

import { db } from "@/drizzle";
import { story } from "@/drizzle/schemas/story";
import { storyInsertSchema, storyUpdateSchema } from "@/zod-schemas/story";
import { eq, sql } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { authActionClient } from "../safe-action";
import { handleFileUpload } from "../utils/image-upload";

import z from "zod/v4";

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
                content: inputData.content,
            })
            .returning({
                isbn: story.isbn,
                title: story.title,
                image: story.image,
            });

        // upload image using isbn as public id
        let imageUrl: string | undefined = undefined;

        if (inputData.image.length > 0) {
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

        return createdStory;
    });

export const updateStoryAction = authActionClient
    .inputSchema(storyUpdateSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .bindArgsSchemas<[isbn: z.ZodUUID]>([z.uuid()])
    .action(
        async ({ parsedInput: updateData, bindArgsParsedInputs: [isbn] }) => {
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
                        content: updateData.content,
                    }),

                    ...(!!updateData.bookId && { bookId: updateData.bookId }),

                    ...(!!imageUrl && { image: imageUrl }),

                    edited: sql`NOW()`,

                    subtitle: updateData.subtitle,
                })
                .where(eq(story.isbn, isbn))
                .returning({
                    isbn: story.isbn,
                    title: story.title,
                    image: story.image,
                });

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
