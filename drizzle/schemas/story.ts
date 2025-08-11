import { image, timestamps } from "@/drizzle/schemas/base";
import { book } from "@/drizzle/schemas/book";
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

export const rating = table(
    "ratings",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
        stars: t.real().notNull(),
        storyISBN: t
            .uuid()
            .notNull()
            .references(() => story.isbn, { onDelete: "cascade" }),
        userId: t
            .text()
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [
        t.index("ratings_stars_idx").on(table.stars),
        t.index("ratings_user_id_idx").on(table.userId),
        t.index("ratings_story_isbn_idx").on(table.storyISBN),
    ]
);

export const storyRelations = relations(story, ({ one, many }) => ({
    author: one(user, {
        fields: [story.authorId],
        references: [user.id],
    }),
    book: one(book, {
        fields: [story.bookId],
        references: [book.id],
    }),
    ratings: many(rating),
}));

export const ratingRelations = relations(rating, ({ one }) => ({
    story: one(story, {
        fields: [rating.storyISBN],
        references: [story.isbn],
    }),
    user: one(user, {
        fields: [rating.userId],
        references: [user.id],
    }),
}));
