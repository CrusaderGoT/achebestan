import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { story } from "./story";
import { user } from "./user";

export const book = table(
    "books",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
        authorId: t
            .text()
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),
        name: t.varchar().notNull(),
        storiesId: t.json().array().notNull(),
    },
    (table) => [
        t.uniqueIndex("books_stories_uidx").on(table.storiesId),
        t.index("books_author_id_idx").on(table.authorId),
    ]
);

export const bookRelations = relations(book, ({ many, one }) => ({
    stories: many(story),
    author: one(user, {
        fields: [book.authorId],
        references: [user.id],
    }),
}));
