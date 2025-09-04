import { book } from "@/drizzle/schemas/book";
import z from "@/node_modules/zod/v4/classic/external.cjs";
import { createInsertSchema } from "drizzle-zod";

export const bookInsertSchema = createInsertSchema(book);

export type bookInsertType = z.infer<typeof bookInsertSchema>;
