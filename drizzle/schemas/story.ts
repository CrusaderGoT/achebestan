import { image, timestamps } from "@/drizzle/schemas/base";
import { user } from "@/drizzle/schemas/user";

import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { book } from "./book";

export const story = table(
    "stories",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
        title: t.varchar().notNull(),
        subtitle: t.varchar(),
        authorId: t
            .text()
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),
        isbn: t.uuid().defaultRandom().notNull(),
        content: t.text().notNull(),
        bookId: t.integer(),
        ...timestamps,
        ...image,
    },
    (table) => [
        t.index("stories_title_idx").on(table.title),
        t.index("stories_subtitle_idx").on(table.subtitle),
        t.index("stories_author_id_idx").on(table.authorId),
        t.index("stories_created_idx").on(table.created),
        t.index("stories_edited_idx").on(table.edited),
        t.uniqueIndex("stories_isbn_uidx").on(table.isbn),
        t.uniqueIndex("stories_book_id_uidx").on(table.bookId),
        t.foreignKey({
            name: "stories_book_id_book_id_fk",
            columns: [table.bookId],
            foreignColumns: [book.id],
        }),
    ]
);

export const storyRelations = relations(story, ({ one }) => ({
    author: one(user, {
        fields: [story.authorId],
        references: [user.id],
    }),
    book: one(book, {
        fields: [story.bookId],
        references: [book.id],
    }),
}));
