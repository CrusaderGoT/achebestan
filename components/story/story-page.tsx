"use client";

import { CommentTreeProps } from "@/types/comment";
import { StoryProps, StoryRatingProps } from "@/types/story";
import { UserRatingWithComment } from "@/zod-schemas/rating";
import { Center, Divider, Stack, Text } from "@mantine/core";
import { CommentTree } from "../comment/comment-tree";
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
                blurb={story.blurb}
                permissions={story.permissions}
            />

            <StoryRating
                ratings={story.ratings}
                isbn={story.isbn}
                userRating={userRating}
            />

            <StoryActions permissions={story.permissions} {...story} />

            <Divider
                label={comments && comments.length > 0 ? "comments" : ""}
            />

            {comments && comments.length > 0 ? (
                <CommentTree comments={comments} />
            ) : (
                <Center>
                    <Text c={"dimmed"}>No Comments Yet...</Text>
                </Center>
            )}
        </Stack>
    );
}
