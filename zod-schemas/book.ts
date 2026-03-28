import { book } from "@/drizzle/schemas/book";
import z from "@/node_modules/zod/v4/classic/external.cjs";
import { createInsertSchema } from "drizzle-zod";

export const bookInsertSchema = createInsertSchema(book).omit({
    created: true,
    edited: true,
    authorId: true,
});

export type bookInsertType = z.infer<typeof bookInsertSchema>;
