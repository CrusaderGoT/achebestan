import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { story } from "./story";
import { user } from "./user";

export const favouriteUserStories = table(
    "favourite_user_stories",
    {
        userId: t
            .text()
            .references(() => user.id, { onDelete: "cascade" })
            .notNull(),
        storyId: t
            .integer()
            .references(() => story.id, { onDelete: "cascade" })
            .notNull(),
    },
    (table) => [t.primaryKey({ columns: [table.userId, table.storyId] })]
);

export const favouriteUserStoriesRelations = relations(
    favouriteUserStories,
    ({ one }) => ({
        user: one(user, {
            fields: [favouriteUserStories.userId],
            references: [user.id],
        }),
        story: one(story, {
            fields: [favouriteUserStories.storyId],
            references: [story.id],
        }),
    })
);
