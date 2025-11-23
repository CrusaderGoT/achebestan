"use client";

import { useCentralizedAuth } from "@/lib/auth/centralized-auth-context-provider";
import {
    canCreateStory,
    canDeleteStory,
    canSuspendStory,
    canUpdateStory,
} from "@/lib/auth/policies";
import { CommentTreeProps } from "@/types/comment";
import { StoryPermissionsType, StoryProps } from "@/types/story";
import { UserSelectType } from "@/types/user";
import { UserRatingWithComment } from "@/zod-schemas/rating";
import { Center, Divider, Stack, Text } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { CommentTree } from "../comment/comment-tree";
import { Story } from "./story";
import { StoryActions } from "./story-actions";
import { StoryRating } from "./story-rating";
import { StoryRatingProps } from "@/types/story";

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
    const { sessionUser } = useCentralizedAuth();

    const noPermissions: StoryPermissionsType = useMemo(
        () => ({
            canDeleteStory: false,
            canUpdateStory: false,
            canCreateStory: false,
            canSuspendStory: false,
        }),
        []
    );

    const [permissions, setPermissions] =
        useState<StoryPermissionsType>(noPermissions);

    useEffect(() => {
        async function checkStoryPermissions(): Promise<StoryPermissionsType> {
            if (!sessionUser.data?.user.id) {
                return noPermissions;
            }

            const storyPermArgs = {
                id: story.id,
                authorId: story.authorId,
            };

            const [canDelete, canUpdate, canCreate, canSuspend] =
                await Promise.all([
                    await canDeleteStory(
                        sessionUser.data?.user as UserSelectType,
                        storyPermArgs
                    ),
                    await canUpdateStory(
                        sessionUser.data?.user as UserSelectType,
                        storyPermArgs
                    ),
                    await canCreateStory(),
                    await canSuspendStory(),
                ]);

            return {
                canDeleteStory: canDelete,
                canUpdateStory: canUpdate,
                canCreateStory: canCreate,
                canSuspendStory: canSuspend,
            };
        }
        checkStoryPermissions().then(setPermissions);
    }, [noPermissions, story.authorId, story.id, sessionUser.data?.user]);

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
                permissions={permissions}
            />

            <StoryRating
                ratings={story.ratings}
                isbn={story.isbn}
                userRating={userRating}
            />

            <StoryActions {...story} />

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
