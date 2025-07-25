"use server";

import { db } from "@/drizzle";
import { story } from "@/drizzle/schemas/story";
import { storyInsertSchema } from "@/zod-schemas/story";
import { flattenValidationErrors } from "next-safe-action";
import { authActionClient } from "../safe-action";
import { handleFileUpload } from "../utils/image-upload";

export const createStoryAction = authActionClient
    .inputSchema(storyInsertSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(async ({ parsedInput: { ...inputData }, ctx }) => {
        let imageUrl: string | undefined = undefined;
        if (inputData.image) {
            const uploadResponse = await handleFileUpload(inputData.image, {
                throwOnError: false,
            });
            imageUrl = uploadResponse?.secure_url;
        }

        const [newStory] = await db
            .insert(story)
            .values({
                authorId: ctx.user.id,
                title: inputData.title,
                subtitle: inputData.subtitle,
                content: inputData.content,
                image: imageUrl,
            })
            .returning();

        return newStory;
    });
