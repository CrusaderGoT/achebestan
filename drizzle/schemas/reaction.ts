import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { comment } from "./comment";
import { user } from "./user";

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
