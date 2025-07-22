import { image, timestamps } from "@/drizzle/schemas/base";
import { user } from "@/drizzle/schemas/user";

import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";

import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

import { z } from "zod/v4";

export const books = table(
    "books",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
        title: t.varchar().notNull(),
        subtitle: t.varchar(),
        authorId: t
            .text()
            .references(() => user.id)
            .notNull(),
        isbn: t.uuid().defaultRandom().notNull(),
        content: t.text().notNull(),
        ...timestamps,
        ...image,
    },
    (table) => [
        t.index("title_idx").on(table.title),
        t.index("subtitle_idx").on(table.subtitle),
        t.uniqueIndex("author_id_idx").on(table.authorId),
        t.index("created_idx").on(table.created),
        t.index("edited_idx").on(table.edited),
        t.uniqueIndex("isbn_idx").on(table.isbn),
    ]
);

export const bookInsertSchema = createInsertSchema(books, {
    content: (schema) =>
        schema.min(100, {
            error: "story content must be at least 100 characters",
        }),
});

export type BookInsertType = z.infer<typeof bookInsertSchema>;

export const bookSelectSchema = createSelectSchema(books);

export type BookSelectType = z.infer<typeof bookSelectSchema>;

export const bookUpdateSchema = createUpdateSchema(books);

export type BookUpdateType = z.infer<typeof bookUpdateSchema>;
