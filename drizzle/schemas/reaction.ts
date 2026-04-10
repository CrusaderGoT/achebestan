import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { comment } from "./comment";
import { user } from "./user";
import { relations } from "drizzle-orm";

export const reaction = table("reactions", {
    id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
    userId: t
        .text()
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    commentId: t
        .integer()
        .notNull()
        .references(() => comment.id, { onDelete: "cascade" }),
    liked: t.boolean().default(false),
    disliked: t.boolean().default(false),
});

export const reactionRelations = relations(reaction, ({ one }) => ({
    comment: one(comment, {
        fields: [reaction.commentId],
        references: [comment.id],
        relationName: "commentReactions",
    }),
    user: one(user, {
        fields: [reaction.userId],
        references: [user.id],
    }),
}));
