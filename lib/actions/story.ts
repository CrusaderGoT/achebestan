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
                title: inputData.title.trim(),
                subtitle: inputData.subtitle,
                content: sanitizeHTML(inputData.content),
                created: new Date(),
                blurb: inputData.blurb,
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

        // revalidate tags/paths once story is created / for Next.js cache
        updateTag("readLatestStories");
        revalidatePath(`/`);

        if (createdStory.bookId) {
            // revalidate book stories list if this story belong to a book
            updateTag(`getBookStories-${createdStory.bookId}`);
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
            icon: imageUrl || "/images/iq_detailed.png",
            badge: "/web-app-manifest-96x96.png",
            tag: `story-${createdStory.title}`,
            data: {
                url: `/stories/${createdStory.isbn}`,
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
    .bindArgsSchemas<
        [
            isbn: z.ZodUUID,
            authorId: z.ZodString,
            prevBookId: z.ZodNullable<z.ZodNumber>,
            prevBookPart: z.ZodNullable<z.ZodNumber>,
        ]
    >([z.uuid(), z.string(), z.int().nullable(), z.int().nullable()])
    .action(
        async ({
            parsedInput: updateData,
            bindArgsParsedInputs: [isbn, authorId, prevBookId, prevBookPart],
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

                    ...(!!updateData.blurb?.trim() && {
                        blurb: updateData.blurb,
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

            if (updatedStory.bookId) {
                // revalidate book stories list if this story belong to a book
                updateTag(`getBookStories-${updatedStory.bookId}`);
            }

            updateTag(`readStory-${updatedStory.isbn}`);
            updateTag("readLatestStories");
            revalidatePath(`/`);

            // shift all subsequent story chapters down by 1 if deleted story belong to a book
            if (prevBookId && prevBookPart) {
                await correctStoriesBookParts({
                    bookId: prevBookId,
                    bookPart: prevBookPart,
                });
            }

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

        if (!storyDb) {
            throw new Error(`Story with ISBN ${isbn} not found`);
        }

        return storyDb;
    } catch (e) {
        throw new Error(`Failed to get story with ISBN ${isbn}`);
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
    try {
        return await db
            .select({ isbn: story.isbn, created: story.created })
            .from(story)
            .limit(latest)
            .orderBy((stories) => desc(stories.created));
    } catch (e) {
        console.log(e);
    }
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
                    isbn: story.isbn,
                });

            if (!deletedStory?.title) {
                revalidatePath("/");
                throw redirect("/");
            }

            // revalidate tags/paths once story is created
            updateTag(`readStory-${deletedStory.isbn}`);
            updateTag("readLatestStories");
            revalidatePath(`/`);

            // shift all subsequent story chapters down by 1 if deleted story belong to a book
            if (deletedStory.bookId && deletedStory.bookPart) {
                await correctStoriesBookParts({
                    bookId: deletedStory.bookId,
                    bookPart: deletedStory.bookPart,
                });
            }

            return deletedStory;
        },
    );

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

export async function searchStories(
    searchText: string,
    options: SearchOptions = {},
) {
    const cleanSearchText = searchText?.trim() || "";

    if (!cleanSearchText) {
        return [];
    }

    const {
        limit = 20, // Defaulted to 20 to match UI needs
        offset = 0,
        sortBy = "created",
        sortOrder = "desc",
        fields = ["title", "subtitle"],
    } = options;

    const searchConditions = [];
    const searchPattern = `%${cleanSearchText}%`;

    // Build conditions safely
    if (fields.includes("title"))
        searchConditions.push(ilike(story.title, searchPattern));
    if (fields.includes("subtitle"))
        searchConditions.push(ilike(story.subtitle, searchPattern));
    // Include isbn if added to fields later
    if (fields.includes("isbn"))
        searchConditions.push(ilike(story.isbn, searchPattern));

    // Fallback if no valid fields provided
    if (searchConditions.length === 0) return [];

    const getOrderBy = () => {
        const direction = sortOrder === "asc" ? asc : desc;
        switch (sortBy) {
            case "title":
                return direction(story.title);
            case "edited":
                return direction(story.edited);
            case "created":
            default:
                return direction(story.created);
        }
    };

    try {
        const stories = await db.query.story.findMany({
            where: or(...searchConditions),
            orderBy: [getOrderBy()],
            limit: Math.min(limit, 50), // Hard cap for API protection
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
        console.error("[searchStories] Error:", error);
        throw new Error("Failed to search stories. Please try again.");
    }
}

async function correctStoriesBookParts({
    bookId,
    bookPart,
}: {
    bookPart: number;
    bookId: number;
}) {
    await db
        .update(story)
        .set({ bookPart: sql`${story.bookPart} - 1` })
        .where(and(eq(story.bookId, bookId), gt(story.bookPart, bookPart)));

    // revalidate book stories list if this story belong to a book
    updateTag(`getBookStories-${bookId}`);
}
