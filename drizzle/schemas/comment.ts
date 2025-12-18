import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { timestamps } from "./base";
import { rating } from "./rating";
import { reaction } from "./reaction";
import { story } from "./story";
import { user } from "./user";

export const comment = table(
    "comments",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
        text: t.text().notNull(),
        parentCommentId: t.integer(),
        ratingId: t
            .integer()
            .references(() => rating.id, { onDelete: "set null" }),

        storyISBN: t
            .uuid()
            .notNull()
            .references(() => story.isbn, { onDelete: "cascade" }),
        userId: t
            .text()
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        ...timestamps,
        hasBeenDeleted: t.boolean().default(false),
    },
    (table) => [
        t
            .foreignKey({
                columns: [table.parentCommentId],
                foreignColumns: [table.id],
                name: "comment_parent_comment_fk",
            })
            .onDelete("cascade"),
        t.index("comment_story_idx").on(table.storyISBN),
        t.index("comment_user_idx").on(table.userId),
        t.index("comment_parent_idx").on(table.parentCommentId),
    ]
);

export const commentRelations = relations(comment, ({ one, many }) => ({
    rating: one(rating, {
        fields: [comment.ratingId],
        references: [rating.id],
    }),
    story: one(story, {
        fields: [comment.storyISBN],
        references: [story.isbn],
    }),
    user: one(user, {
        fields: [comment.userId],
        references: [user.id],
    }),
    parentComment: one(comment, {
        fields: [comment.parentCommentId],
        references: [comment.id],
        relationName: "parentChild",
    }),
    childComments: many(comment, {
        relationName: "parentChild",
    }),
    reactions: many(reaction),
}));
