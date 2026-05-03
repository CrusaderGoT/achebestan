import { favouriteUserStories } from "@/drizzle/schemas/favourite";
import { story, storyDraft } from "@/drizzle/schemas/story";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod/v4";

export const storySelectSchema = createSelectSchema(story);

export const storyUpdateSchema = createUpdateSchema(story, {
    image: z.file().optional(),
}).omit({
    created: true,
    edited: true,
    authorId: true,
    isbn: true,
    bookPart: true,
});

export const storyInsertSchema = createInsertSchema(story, {
    title: (schema) =>
        schema
            .min(3, { error: "title must atleast be 3 characters" })
            .max(60, { error: "title must not exceed 60 characters" })
            .nonempty(),
    content: (schema) =>
        schema
            .min(100, {
                error: "story content must be at least 100 characters",
            })
            .nonempty(),
    image: z.file().optional(),
}).omit({
    created: true,
    edited: true,
    authorId: true,
    isbn: true,
    bookPart: true,
});

export const favouriteInserSchema = createInsertSchema(favouriteUserStories);

export const storyDraftInsertSchema = createInsertSchema(storyDraft);

export const storyDraftSelectSchema = createSelectSchema(storyDraft);

export const syncStoryDraftActionSchema = storyDraftInsertSchema.extend({
    id: storyDraftSelectSchema.shape.id.optional(),
});
