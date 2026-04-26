"use client";

import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { useReadStoryComments } from "@/lib/hooks/comment/read-story-comments";
import { useStoryRating } from "@/lib/hooks/rating/story-rating";
import { useUserRating } from "@/lib/hooks/rating/user-rating";
import { useReadStory } from "@/lib/hooks/story/read-story";
import { useStoryPermissions } from "@/lib/hooks/story/story-permissions";
import { CommentTreeProps } from "@/types/comment";
import { StoryPermAuthorProps, StoryRatingProps } from "@/types/story";
import { UserSelectType } from "@/types/user";
import { Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notFound } from "next/navigation";
import { useEffect } from "react";
import { BookPagination } from "../book/book-pagination";
import { CommentSection } from "../comment/comment-tree";
import { Story } from "./story";
import { StoryActions } from "./story-actions";
import { StoryRating } from "./story-rating";

export type StoryPageClientProps = {
    isbn: string;
    storyPrefetched?: StoryPermAuthorProps & StoryRatingProps;
    commentsPrefetched?: CommentTreeProps[];
};

export function StoryPageClient({
    isbn,
    storyPrefetched,
    commentsPrefetched,
}: StoryPageClientProps) {
    const {
        sessionUser: { data: session },
    } = useCentralizedAuth();

    const { data: story = storyPrefetched, isSuccess } = useReadStory({ isbn });

    // Restore scroll position after story content is fully loaded.
    useEffect(() => {
        if (!isSuccess) return;

        const saved = sessionStorage.getItem(`book-${story?.bookId}-yScroll`);
        if (!saved) return;

        sessionStorage.removeItem(`book-${story?.bookId}-yScroll`);

        const y = Number(saved);
        if (!y) return;

        requestAnimationFrame(() => {
            window.scrollTo({ top: y, behavior: "instant" });
        });
    }, [isSuccess, story?.bookId]);

    const { data: comments = commentsPrefetched ?? [] } = useReadStoryComments({
        isbn,
    });

    const { data: userRating } = useUserRating({
        isbn,
        userId: session?.user.id,
    });

    const { data: storyRatings = story?.ratings || [] } = useStoryRating({
        isbn,
    });

    const commentBoxDisclosure = useDisclosure(false);

    const { data: permissions } = useStoryPermissions({
        user: session?.user as UserSelectType | undefined,
        storyId: story?.id,
        authorId: story?.authorId,
    });

    if (!story) notFound();

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
                ratings={storyRatings}
                isbn={story.isbn}
                userRating={userRating}
            />

            {story.bookId && story.bookPart && (
                <BookPagination
                    storyPart={story.bookPart}
                    bookId={story.bookId}
                />
            )}

            <StoryActions
                permissions={permissions}
                commentBoxDisclosure={commentBoxDisclosure}
                {...story}
            />

            <CommentSection
                comments={comments}
                storyAuthorId={story.authorId}
                storyISBN={story.isbn}
                commentBoxDisclosure={commentBoxDisclosure}
                canComment={permissions?.canComment}
            />
        </Stack>
    );
}
