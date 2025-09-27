import {
    favouriteInserSchema,
    storyInsertSchema,
    storySelectSchema,
    storyUpdateSchema,
} from "@/zod-schemas/story";
import { userSelectType } from "@/zod-schemas/user";
import { z } from "zod/v4";

export interface StoryBookProps extends StorySelectType {
    author: userSelectType;
}

export type PickedStoryProps = Pick<
    StorySelectType,
    "content" | "title" | "blurb" | "isbn" | "authorId" | "id"
>;

export type FavouriteInserType = z.infer<typeof favouriteInserSchema>;

export type StoryInsertType = z.infer<typeof storyInsertSchema>;

export type StoryUpdateType = z.infer<typeof storyUpdateSchema>;

export type StorySelectType = z.infer<typeof storySelectSchema>;

export interface SearchOptions {
    limit?: number;
    offset?: number;
    sortBy?: "created" | "edited" | "title";
    sortOrder?: "asc" | "desc";
    fields?: Array<"title" | "subtitle">;
}
