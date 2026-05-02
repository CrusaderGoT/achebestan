import { image, timestamps } from "@/drizzle/schemas/base";
import { book } from "@/drizzle/schemas/book";
import { user } from "@/drizzle/schemas/user";

import { relations, sql } from "drizzle-orm";

import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { comment } from "./comment";
import { favouriteUserStories } from "./favourite";
import { rating } from "./rating";

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
        bookPart: t.integer(),
        ...timestamps,
        ...image,
        blurb: t.text(),
    },
    (table) => [
        t.index("stories_title_idx").on(table.title),
        t.index("stories_subtitle_idx").on(table.subtitle),
        t.index("stories_author_id_idx").on(table.authorId),
        t.index("stories_created_idx").on(table.created),
        t.index("stories_edited_idx").on(table.edited),
        t.index("stories_book_id_idx").on(table.bookId),
        t.uniqueIndex("stories_isbn_uidx").on(table.isbn),
        t
            .foreignKey({
                name: "stories_book_id_book_id_fk",
                columns: [table.bookId],
                foreignColumns: [book.id],
            })
            .onDelete("set null"),
        t.check(
            "book_fields_together",
            sql`(${table.bookId} IS NULL AND ${table.bookPart} IS NULL) OR 
            (${table.bookId} IS NOT NULL AND ${table.bookPart} IS NOT NULL)`,
        ),
        t
            .unique("stories_book_id_book_part_uidx")
            .on(table.bookId, table.bookPart),
    ],
);

export const storyDraft = table("story_drafts", {
    id: t.integer("id").primaryKey(),

    title: t.text("title").notNull(),

    subtitle: t.text("subtitle"),

    content: t.text("content").notNull(),

    blurb: t.text("blurb"),

    created: t.integer("created").notNull(),
    updated: t.integer("updated").notNull(),

    book: t.jsonb("book").$type<{
        label: string;
        value: string;
        disabled?: boolean;
    }>(),
});

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
    comments: many(comment),
    favourites: many(favouriteUserStories),
}));
