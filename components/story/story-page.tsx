"use client";

import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { useReadStoryComments } from "@/lib/hooks/comment/read-story-comments";
import { useUserRating } from "@/lib/hooks/rating/user-rating";
import { useReadStory } from "@/lib/hooks/story/read-story";
import { useStoryPermissions } from "@/lib/hooks/story/story-permissions";
import { UserSelectType } from "@/types/user";
import { Stack } from "@mantine/core";
import { notFound } from "next/navigation";
import { BookPagination } from "../book/book-pagination";
import { CommentSection } from "../comment/comment-tree";
import { Story } from "./story";
import { StoryActions } from "./story-actions";
import { StoryRating } from "./story-rating";

export type StoryPageClientProps = {
    isbn: string;
};

export function StoryPageClient({ isbn }: StoryPageClientProps) {
    const {
        sessionUser: { data: session },
    } = useCentralizedAuth();

    const { data: story } = useReadStory({ isbn });

    const { data: comments } = useReadStoryComments({ isbn });

    const { data: userRating } = useUserRating({
        isbn,
        userId: session?.user.id,
    });

    if (!story) notFound();

    const { data: permissions } = useStoryPermissions({
        user: session?.user as UserSelectType,
        storyId: story.id,
        authorId: story.authorId,
    });

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
                permissions={permissions}
            />

            <StoryRating
                ratings={story.ratings}
                isbn={story.isbn}
                userRating={userRating}
            />

            {story.bookId && story.bookPart && (
                <BookPagination
                    storyPart={story.bookPart}
                    bookId={story.bookId}
                />
            )}

            <StoryActions permissions={permissions} {...story} />

            <CommentSection
                comments={comments}
                storyAuthorId={story.authorId}
            />
        </Stack>
    );
}
