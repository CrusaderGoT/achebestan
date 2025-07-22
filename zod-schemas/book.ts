import { books } from "@/drizzle/schemas/book";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod/v4";

export const bookSelectSchema = createSelectSchema(books);
export const bookUpdateSchema = createUpdateSchema(books);
export type BookInsertType = z.infer<typeof bookInsertSchema>;
export type BookSelectType = z.infer<typeof bookSelectSchema>;
export type BookUpdateType = z.infer<typeof bookUpdateSchema>;
export const bookInsertSchema = createInsertSchema(books, {
    title: (schema) =>
        schema.max(256, { error: "title must not exceed 256 characters" }),
    content: (schema) =>
        schema.min(100, {
            error: "story content must be at least 100 characters",
        }),
    authorId: (schema) => schema.optional(), // to allow dynamic assigning from user session,
});
