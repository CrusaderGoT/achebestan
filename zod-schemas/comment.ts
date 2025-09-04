import { comment } from "@/drizzle/schemas/comment";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod/v4";

export const commentInsertSchema = createInsertSchema(comment, {
    userId: (schema) => schema.optional(),
    text: (schema) => schema.nonempty(),
});

export type CommentInsertType = z.infer<typeof commentInsertSchema>;

export const commentSelectSchema = createSelectSchema(comment);

export type CommentSelectType = z.infer<typeof commentSelectSchema>;

export const commentUpdateSchema = createUpdateSchema(comment, {
    text: z.string().nonempty(),
    storyISBN: z.uuid(),
    userId: z.string().nonempty(),
});

export type CommentUpdateType = z.infer<typeof commentUpdateSchema>;
