"use client";

import { CommentTreeProps } from "@/types/comment";
import { StoryProps, StoryRatingProps } from "@/types/story";
import { UserRatingWithComment } from "@/zod-schemas/rating";
import { Stack } from "@mantine/core";
import { CommentSection } from "../comment/comment-tree";
import { BookPagination } from "./book-pagination";
import { Story } from "./story";
import { StoryActions } from "./story-actions";
import { StoryRating } from "./story-rating";

export type StoryPageClientProps = {
    story: StoryProps & StoryRatingProps;
    comments?: CommentTreeProps[];
    userRating?: UserRatingWithComment;
};

export function StoryPageClient({
    story,
    comments,
    userRating,
}: StoryPageClientProps) {
    return (
        <Stack>
            <Story
                image={story.image}
                title={story.title}
                author={story.author}
                content={story.content}
                created={story.created}
                edited={story.edited}
                id={story.id}
                isbn={story.isbn}
                authorId={story.authorId}
                subtitle={story.subtitle}
                bookId={story.bookId}
                bookPart={story.bookPart}
                blurb={story.blurb}
                permissions={story.permissions}
            />

            <StoryRating
                ratings={story.ratings}
                isbn={story.isbn}
                userRating={userRating}
            />

            {story.bookId && story.bookPart && (
                <BookPagination
                    bookId={story.bookId}
                    bookPart={story.bookPart}
                />
            )}

            <StoryActions permissions={story.permissions} {...story} />

            <CommentSection comments={comments} />
        </Stack>
    );
}
