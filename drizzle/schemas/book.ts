import { image, timestamps } from "@/drizzle/schemas/base";
import { user } from "@/drizzle/schemas/user";

import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";

export const books = table(
    "books",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
        title: t.varchar({ length: 256 }).notNull(),
        subtitle: t.varchar({ length: 100 }),
        authorId: t
            .text()
            .references(() => user.id)
            .notNull(),
        isbn: t.uuid().defaultRandom().notNull(),
        ...timestamps,
        ...image,
    },
    (table) => [
        t.index("title_idx").on(table.title),
        t.uniqueIndex("author_id_idx").on(table.authorId),
        t.index("created_idx").on(table.created),
        t.uniqueIndex("isbn_idx").on(table.isbn),
    ]
);
