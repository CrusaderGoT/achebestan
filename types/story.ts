import { authClient } from "@/lib/auth-client";
import {
    favouriteInserSchema,
    storyInsertSchema,
    storySelectSchema,
    storyUpdateSchema,
} from "@/zod-schemas/story";
import { userSelectType } from "@/zod-schemas/user";
import { UseFormReturnType } from "@mantine/form";
import { z } from "zod/v4";
import { StoryUpdateType } from "./story";

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
}export type StoryContentType = {
    toggleContentField: () => void;
    openedContentField: boolean;
    content: string;
    form: UseFormReturnType<StoryUpdateType>;
    session: ReturnType<typeof authClient.useSession>;
    storyAuthorId: string;
    storyISBN: string;
};

