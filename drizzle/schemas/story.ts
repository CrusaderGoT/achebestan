import { image, timestamps } from "@/drizzle/schemas/base";
import { user } from "@/drizzle/schemas/user";

import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";

export const story = table(
    "stories",
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
        t.index("author_id_idx").on(table.authorId),
        t.index("created_idx").on(table.created),
        t.index("edited_idx").on(table.edited),
        t.uniqueIndex("isbn_idx").on(table.isbn),
    ]
);

export const storyRelations = relations(story, ({ one }) => ({
    author: one(user, {
        fields: [story.authorId],
        references: [user.id],
    }),
}));
