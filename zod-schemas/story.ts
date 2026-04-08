import { favouriteUserStories } from "@/drizzle/schemas/favourite";
import { story } from "@/drizzle/schemas/story";
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
        schema.max(256, { error: "title must not exceed 256 characters" }),
    content: (schema) =>
        schema.min(100, {
            error: "story content must be at least 100 characters",
        }),
    authorId: (schema) => schema.optional(), // to allow dynamic assigning from user session,
    image: z.file().optional(),
}).omit({
    created: true,
    edited: true,
    authorId: true,
    isbn: true,
    bookPart: true,
});

export const favouriteInserSchema = createInsertSchema(favouriteUserStories);
