import { RatingSelectType, UserRatingWithComment } from "@/zod-schemas/rating";
import {
    favouriteInserSchema,
    storyDraftSelectSchema,
    storyInsertSchema,
    storySelectSchema,
    storyUpdateSchema,
} from "@/zod-schemas/story";
import { ComboboxItem } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { DBSchema } from "idb";
import { z } from "zod/v4";
import { UserSelectType } from "./user";

export interface StoryAuthorProps extends StorySelectType {
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
    fields?: Array<"title" | "subtitle" | "isbn">;
}

export type StoryContentType = {
    toggleContentField: () => void;
    openedContentField: boolean;
    content: string;
    form: UseFormReturnType<StoryUpdateType>;
    storyISBN: string;
    permissions?: StoryPermissionsType;
};

export interface StoryPermAuthorProps extends StoryAuthorProps {
    permissions?: StoryPermissionsType;
}

export type StoryPermissionsType = {
    canCreate?: boolean; // this can be optional; since it use case is currently called seperating
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

export type StoryIndexDbSchemaType = z.infer<typeof storyDraftSelectSchema>;

export type StoryIndexDbSchema = DBSchema & {
    stories: {
        value: StoryIndexDbSchemaType;
        key: number;
        indexes: { "author-id": string; created: number };
    };
};

export type StoryIndexDbSchemaTypess = Omit<
    StoryInsertType,
    "bookId" | "image"
> & {
    id?: number;
    created: number;
    updated: number;
    book: ComboboxItem | null;
};
