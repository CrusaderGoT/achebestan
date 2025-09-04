import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { story } from "./story";
import { comment } from "./comment";
import { user } from "./user";

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

export const ratingRelations = relations(rating, ({ one }) => ({
    story: one(story, {
        fields: [rating.storyISBN],
        references: [story.isbn],
    }),
    user: one(user, {
        fields: [rating.userId],
        references: [user.id],
    }),
    comment: one(comment),
}));
