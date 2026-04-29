"use server";

import { db } from "@/drizzle";
import { favouriteUserStories } from "@/drizzle/schemas/favourite";
import { favouriteInserSchema } from "@/zod-schemas/story";
import { and, eq } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import z from "zod/v4";
import { authActionClient } from "../safe-action";

export const favouriteStoryAction = authActionClient
    .inputSchema(favouriteInserSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .bindArgsSchemas<[actionType: z.ZodEnum]>([z.enum(["insert", "delete"])])
    .action(
        async ({ parsedInput, bindArgsParsedInputs: [actionType], ctx }) => {
            const coreValues = {
                userId: ctx.user.id,
                storyId: parsedInput.storyId,
                success: false,
                created: false,
                deleted: false,
            };

            if (actionType === "insert") {
                // check if exist previous
                const exist = await db.query.favouriteUserStories.findFirst({
                    where(fields, operators) {
                        return operators.and(
                            operators.eq(fields.storyId, parsedInput.storyId),
                            operators.eq(fields.userId, parsedInput.userId),
                        );
                    },
                });

                if (exist) {
                    return { ...coreValues, success: true, created: true };
                }

                await db.insert(favouriteUserStories).values({
                    storyId: parsedInput.storyId,
                    userId: parsedInput.userId,
                });

                return { ...coreValues, success: true, created: true };
            } else if (actionType === "delete") {
                await db
                    .delete(favouriteUserStories)
                    .where(
                        and(
                            eq(favouriteUserStories.userId, parsedInput.userId),
                            eq(
                                favouriteUserStories.storyId,
                                parsedInput.storyId,
                            ),
                        ),
                    );

                return { ...coreValues, success: true, deleted: true };
            } else {
                return { ...coreValues, success: false };
            }
        },
    );

export const getfavouriteUserStory = async (
    userId: string,
    storyId: number,
) => {
    try {
        const favourite = await db.query.favouriteUserStories.findFirst({
            where(favouriteUserStories, operators) {
                return operators.and(
                    operators.eq(favouriteUserStories.storyId, storyId),
                    operators.eq(favouriteUserStories.userId, userId),
                );
            },
        });

        return favourite;
    } catch (e) {
        console.log(e);
    }
};
