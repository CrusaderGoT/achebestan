import { getBookAndStories } from "@/lib/actions/book";
import { bookInsertSchema, bookSelectSchema } from "@/zod-schemas/book";
import z from "zod/v4";

export type BookAndStoriesType = Awaited<ReturnType<typeof getBookAndStories>>;

export type BookSelectType = z.infer<typeof bookSelectSchema>;

export type BookInsertType = z.infer<typeof bookInsertSchema>;
