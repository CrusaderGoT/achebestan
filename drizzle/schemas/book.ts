import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgTable as table } from "drizzle-orm/pg-core";
import { story } from "./story";

export const book = table(
    "books",
    {
        id: t.integer().primaryKey().generatedAlwaysAsIdentity().notNull(),
        name: t.varchar().notNull(),
        storiesId: t.json().array().notNull(),
    },
    (table) => [t.uniqueIndex("books_stories_uidx").on(table.storiesId)]
);

export const bookRelations = relations(story, ({ many }) => ({
    stories: many(story),
}));
