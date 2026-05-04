import { book } from "@/drizzle/schemas/book";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const bookInsertSchema = createInsertSchema(book).omit({
    created: true,
    edited: true,
    authorId: true,
});

export const bookSelectSchema = createSelectSchema(book);
