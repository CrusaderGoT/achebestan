"use client";

import { useDislike, useLike } from "@/lib/hooks/comment/comment-reaction-hook";
import { ReactionSelectType } from "@/zod-schemas/reaction";
import { ActionIcon } from "@mantine/core";
import {
    IconThumbDown,
    IconThumbDownFilled,
    IconThumbUp,
    IconThumbUpFilled,
} from "@tabler/icons-react";
import { useState } from "react";

type LikeDislikeButtonProps = {
    commentId: number;
    likes: number | undefined;
    dislikes: number | undefined;
    userReaction?: ReactionSelectType;
    userId: string;
};

export function LikeDislikeButton({
    commentId,
    userId,
    likes = 0,
    dislikes = 0,
    userReaction,
}: LikeDislikeButtonProps) {
    const {
        executeAsync: executeAsyncLikeComment,
        isPending: isPendingLikeComment,
    } = useLike();

    const {
        executeAsync: executeAsyncDislikeComment,
        isPending: isPendingDislikeComment,
    } = useDislike();

    const [reaction, setReaction] = useState<boolean | undefined>(
        userReaction?.liked ?? userReaction?.disliked ?? undefined
    );

    return (
        <ActionIcon.Group>
            <ActionIcon
                variant="default"
                onClick={async () => {
                    const result = await executeAsyncLikeComment({
                        commentId: commentId,
                        userId: userId,
                    });

                    if (result.data?.deleted) {
                        setReaction(undefined);
                    } else if (result.data?.liked) {
                        setReaction(true);
                    }
                }}
                disabled={isPendingDislikeComment}
                loading={isPendingLikeComment}
                size={"md"}
            >
                {reaction ? (
                    <IconThumbUpFilled
                        color="var(--mantine-color-blue-text)"
                        size={16}
                    />
                ) : (
                    <IconThumbUp
                        color="var(--mantine-color-blue-text)"
                        size={16}
                    />
                )}
            </ActionIcon>

            <ActionIcon.GroupSection
                variant="default"
                bg="var(--mantine-color-body)"
                size={"md"}
            >
                {likes}
            </ActionIcon.GroupSection>

            <ActionIcon
                variant="default"
                onClick={async () => {
                    const result = await executeAsyncDislikeComment({
                        commentId: commentId,
                        userId: userId,
                    });

                    if (result.data?.deleted) {
                        setReaction(undefined);
                    } else if (result.data?.disliked) {
                        setReaction(false);
                    }
                }}
                disabled={isPendingLikeComment}
                loading={isPendingDislikeComment}
                size={"md"}
            >
                {!reaction && reaction !== undefined ? (
                    <IconThumbDownFilled
                        color="var(--mantine-color-red-text)"
                        size={16}
                    />
                ) : (
                    <IconThumbDown
                        color="var(--mantine-color-red-text)"
                        size={16}
                    />
                )}
            </ActionIcon>

            <ActionIcon.GroupSection
                variant="default"
                bg="var(--mantine-color-body)"
                size={"md"}
            >
                {dislikes}
            </ActionIcon.GroupSection>
        </ActionIcon.Group>
    );
}
