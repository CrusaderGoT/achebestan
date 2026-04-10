"use server";

import { db } from "@/drizzle";
import { story } from "@/drizzle/schemas/story";
import { storyInsertSchema, storyUpdateSchema } from "@/zod-schemas/story";
import { and, asc, desc, eq, gt, ilike, or, sql } from "drizzle-orm";
import { flattenValidationErrors } from "next-safe-action";
import { authActionClient } from "../safe-action";
import { handleFileUpload } from "../utils/image-upload";

import z from "zod/v4";

import { SearchOptions } from "@/types/story";
import { UserSelectType } from "@/types/user";
import { cacheTag, revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import {
    canCreateStory,
    canDeleteStory,
    canUpdateStory,
} from "../auth/policies/story-policy";
import { sendNotificationToAllSubscribers } from "../utils/pwa/send-to-subscriber";
import { sanitizeHTML } from "../utils/sanitize-html";

export const createStoryAction = authActionClient
    .inputSchema(storyInsertSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(async ({ parsedInput: inputData, ctx }) => {
        const canCreate = await canCreateStory();

        if (!canCreate) {
            throw new Error("You Are Not Authorized To Create Stories!");
        }

        const chapter = await makeStoryChapter(inputData.bookId);

        // insert new story
        const [createdStory] = await db
            .insert(story)
            .values({
                authorId: ctx.user.id,
                title: inputData.title,
                subtitle: inputData.subtitle,
                content: sanitizeHTML(inputData.content),
                created: new Date(),
                ...(inputData.bookId && chapter != undefined // avoid falsy when 0
                    ? {
                          bookId: inputData.bookId,
                          bookPart: chapter + 1,
                      }
                    : {}),
            })
            .returning({
                isbn: story.isbn,
                title: story.title,
                image: story.image,
                bookId: story.bookId,
                authorId: story.authorId,
            });

        // revalidate tags/paths once story is created
        updateTag("readLatestStories");
        revalidatePath(`/`);

        if (createdStory.bookId) {
            updateTag(`getBookStories-${createdStory.bookId}`);
            updateTag(`readStoryBook-${createdStory.bookId}`);
        }

        // upload image using isbn as public id
        let imageUrl: string | undefined = undefined;

        if (inputData.image && inputData.image) {
            const uploadResponse = await handleFileUpload(
                inputData.image,
                createdStory.isbn,
                {
                    throwOnError: true,
                },
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

        // Send push notification to all subscribers
        await sendNotificationToAllSubscribers({
            title: `${ctx.user.name} Published A New Story📝`,
            body: createdStory.title,
            icon: "/web-app-manifest-192x192.png",
            badge: "/icon1.png",
            tag: `story-${createdStory.title}`,
            data: {
                url: `/story/${createdStory.isbn}`,
                storyId: createdStory.isbn,
            },
            actions: [
                {
                    action: "open",
                    title: "Read Now",
                },
                {
                    action: "close",
                    title: "Dismiss",
                },
            ],
        });

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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { image, ...updateDataWithoutImage } = updateData;

            const canUpdate = await canUpdateStory(ctx.user as UserSelectType, {
                authorId: authorId,
                ...updateDataWithoutImage,
            });

            if (!canUpdate) {
                throw new Error("You Are Not Authorized To Edit This Story!");
            }

            let imageUrl: string | undefined = undefined;

            if (updateData.image) {
                const uploadResponse = await handleFileUpload(
                    updateData.image, //upload the last image
                    isbn, // overwrite this publicId
                    {
                        throwOnError: true,
                    },
                );
                imageUrl = uploadResponse?.secure_url;
            }

            const chapter = await makeStoryChapter(updateData.bookId);

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

                    ...(!!updateData.subtitle?.trim() && {
                        subtitle: updateData.subtitle,
                    }),

                    ...(updateData.bookId && chapter != undefined // avoid falsy when 0
                        ? {
                              bookId: updateData.bookId,
                              bookPart: chapter + 1,
                          }
                        : {}),

                    edited: new Date(),
                })
                .where(eq(story.isbn, isbn))
                .returning();

            updateTag(`readStory-${updatedStory.isbn}`);
            revalidatePath(`/story/${updatedStory.isbn}`);

            return updatedStory;
        },
    );

export const readStory = async (isbn: string) => {
    "use cache";

    cacheTag(`readStory-${isbn}`);

    try {
        const storyDb = await db.query.story.findFirst({
            where(story, operators) {
                return operators.eq(story.isbn, isbn);
            },
            with: {
                author: true,
                ratings: true,
            },
        });

        return storyDb;
    } catch (e) {
        console.log(e);
        throw new Error("Story not found");
    }
};

export const readLatestStories = async (latest: number = 10) => {
    "use cache";

    cacheTag("readLatestStories");

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

export const readLatestStoryISBNs = async (latest: number = 10) => {
    "use cache";
    cacheTag("readLatestStories"); // same tag as readLatestStories since they share cache invalidation

    return await db
        .select({ isbn: story.isbn, created: story.created })
        .from(story)
        .limit(latest)
        .orderBy((stories) => desc(stories.created));
};

export const deleteStoryAction = authActionClient
    .inputSchema(
        z.object({
            isbn: z.uuid(),
        }),
    )
    .bindArgsSchemas<[authorId: z.ZodString]>([z.string()])
    .action(
        async ({
            ctx,
            parsedInput: { isbn },
            bindArgsParsedInputs: [authorId],
        }) => {
            const canDelete = await canDeleteStory(ctx.user as UserSelectType, {
                authorId: authorId,
                isbn: isbn,
            });

            if (!canDelete) {
                throw new Error("You Are Not Authorized To Delete This Story!");
            }

            const [deletedStory] = await db
                .delete(story)
                .where(
                    and(eq(story.isbn, isbn), eq(story.authorId, ctx.user.id)),
                )
                .returning({
                    title: story.title,
                    bookPart: story.bookPart,
                    bookId: story.bookId,
                });

            if (!deletedStory?.title) {
                revalidatePath("/");
                throw redirect("/");
            }

            // revalidate tags/paths once story is created
            updateTag("readLatestStories");
            revalidatePath(`/`);

            // shift all subsequent story chapters down by 1 if deleted story belong to a book
            if (deletedStory.bookId && deletedStory.bookPart) {
                await db
                    .update(story)
                    .set({ bookPart: sql`${story.bookPart} - 1` })
                    .where(
                        and(
                            eq(story.bookId, deletedStory.bookId),
                            gt(story.bookPart, deletedStory.bookPart),
                        ),
                    );

                updateTag(`getBookStories-${story.bookId}`);
                updateTag(`readStoryBook-${story.bookId}`);
            }

            return deletedStory;
        },
    );

export async function searchStories(
    searchText: string,
    options: SearchOptions = {},
) {
    // Input validation
    if (!searchText?.trim()) {
        return [];
    }

    // Sanitize and prepare search text
    const cleanSearchText = searchText.trim();

    if (cleanSearchText.length === 0) {
        return [];
    }

    const {
        limit = 50,
        offset = 0,
        sortBy = "created",
        sortOrder = "desc",
        fields = ["title", "subtitle", "isbn"],
    } = options;

    // Build search conditions based on selected fields
    const searchConditions = [];

    if (fields.includes("title")) {
        searchConditions.push(ilike(story.title, `%${cleanSearchText}%`));
    }

    if (fields.includes("subtitle")) {
        searchConditions.push(ilike(story.subtitle, `%${cleanSearchText}%`));
    }

    // Build order by clause
    const getOrderBy = () => {
        const direction = sortOrder === "asc" ? asc : desc;

        switch (sortBy) {
            case "title":
                return [direction(story.title)];
            case "edited":
                return [direction(story.edited)];
            case "created":
            default:
                return [direction(story.created)];
        }
    };

    try {
        // Execute search with basic conditions (no complex ranking for now)
        const stories = await db.query.story.findMany({
            where: or(...searchConditions),
            orderBy: getOrderBy(),
            limit: Math.min(limit, 100), // Cap at 100 for performance
            offset: Math.max(offset, 0),
            columns: {
                id: true,
                title: true,
                subtitle: true,
                created: true,
                edited: true,
                isbn: true,
                authorId: true,
                bookId: true,
                image: true,
                blurb: true,
            },
        });

        return stories;
    } catch (error) {
        console.error("Search error:", error);
        throw new Error("Failed to search stories");
    }
}

export async function makeStoryChapter(bookId: number | null | undefined) {
    // get the current max chapter for this story
    let chapter: undefined | number = undefined;

    if (bookId) {
        const [{ max }] = await db
            .select({
                max: sql<number>`coalesce(max(${story.bookPart}), 0)`,
            })
            .from(story)
            .where(eq(story.bookId, bookId));

        chapter = max;
    }

    return chapter;
}
