"use client";

import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { useStoryPermissions } from "@/lib/hooks/story/use-story-permissions";
import { BookStoriesType } from "@/types/books";
import { CommentTreeProps } from "@/types/comment";
import { StoryProps, StoryRatingProps } from "@/types/story";
import { UserSelectType } from "@/types/user";
import { UserRatingWithComment } from "@/zod-schemas/rating";
import { Stack } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { BookPagination } from "../book/book-pagination";
import { CommentSection } from "../comment/comment-tree";
import { Story } from "./story";
import { StoryActions } from "./story-actions";
import { StoryRating } from "./story-rating";

export type StoryPageClientProps = {
    story: StoryProps & StoryRatingProps;
    comments?: CommentTreeProps[];
    userRating?: UserRatingWithComment;
    book: BookStoriesType;
};

export function StoryPageClient({
    story,
    comments,
    userRating,
    book,
}: StoryPageClientProps) {
    const mounted = useMounted();

    const {
        sessionUser: { data: session },
    } = useCentralizedAuth();

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

            {mounted && (book?.length ?? 0) > 1 && story.bookPart != null && (
                <BookPagination chapters={book} part={story.bookPart} />
            )}

            <StoryActions permissions={permissions} {...story} />

            <CommentSection comments={comments} />
        </Stack>
    );
}
