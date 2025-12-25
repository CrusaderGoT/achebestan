import { authClient } from "@/lib/auth-client";
import { RatingSelectType, UserRatingWithComment } from "@/zod-schemas/rating";
import {
    favouriteInserSchema,
    storyInsertSchema,
    storySelectSchema,
    storyUpdateSchema,
} from "@/zod-schemas/story";
import { UseFormReturnType } from "@mantine/form";
import { z } from "zod/v4";
import { UserSelectType } from "./user";

export interface StoryBookProps extends StorySelectType {
    author: UserSelectType;
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

export type StoryContentType = {
    toggleContentField: () => void;
    openedContentField: boolean;
    content: string;
    form: UseFormReturnType<StoryUpdateType>;
    session: ReturnType<typeof authClient.useSession>;
    storyAuthorId: string;
    storyISBN: string;
    permissions?: StoryPermissionsType;
};

export interface StoryProps extends StorySelectType {
    author: UserSelectType;
    permissions?: StoryPermissionsType;
}

export type StoryPermissionsType = {
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canSuspend: boolean;
    canComment?: boolean;
};

export type StoryRatingProps = {
    ratings: RatingSelectType[];
    isbn: string;
    userRating?: UserRatingWithComment;
};
