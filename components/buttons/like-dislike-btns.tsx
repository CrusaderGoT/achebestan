"use client";

import {
    useDislikeComment,
    useLikeComment,
} from "@/lib/hooks/reaction/comment-reaction-hook";
import { ReactionSelectType } from "@/zod-schemas/reaction";
import { ActionIcon } from "@mantine/core";
import { useCounter } from "@mantine/hooks";
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
    } = useLikeComment();

    const [like, { increment: incrementLike, decrement: decrementLike }] =
        useCounter(likes);

    const [
        dislike,
        { increment: incrementDislike, decrement: decrementDislike },
    ] = useCounter(dislikes);

    const {
        executeAsync: executeAsyncDislikeComment,
        isPending: isPendingDislikeComment,
    } = useDislikeComment();

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
                        decrementLike();
                    } else if (result.data?.liked) {
                        if (!reaction && reaction !== undefined) {
                            decrementDislike();
                        }
                        setReaction(true);
                        incrementLike();
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
                {like}
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
                        decrementDislike();
                    } else if (result.data?.disliked) {
                        if (reaction) {
                            decrementLike();
                        }
                        setReaction(false);
                        incrementDislike();
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
                {dislike}
            </ActionIcon.GroupSection>
        </ActionIcon.Group>
    );
}
