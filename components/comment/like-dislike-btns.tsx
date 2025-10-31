import { useCentralizedAuth } from "@/lib/auth/centralized-auth-context-provider";
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
import { useEffect, useState } from "react";

type LikeDislikeButtonProps = {
    commentId: number;
    likes: number | undefined;
    dislikes: number | undefined;
    userReaction?: ReactionSelectType;
};

export function LikeDislikeButton({
    commentId,
    likes = 0,
    dislikes = 0,
    userReaction,
}: LikeDislikeButtonProps) {
    const { sessionUser } = useCentralizedAuth();

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

    const [likeReaction, setLikeReaction] = useState<boolean | undefined>(
        userReaction?.liked ?? undefined
    );

    const [dislikeReaction, setDislikeReaction] = useState<boolean | undefined>(
        userReaction?.disliked ?? undefined
    );

    useEffect(() => {
        setDislikeReaction(userReaction?.disliked ?? undefined);
        setLikeReaction(userReaction?.liked ?? undefined);
    }, [userReaction, sessionUser.data?.user.id]);

    return (
        <ActionIcon.Group>
            <ActionIcon
                variant="default"
                onClick={async () => {
                    if (sessionUser.data?.user.id) {
                        const result = await executeAsyncLikeComment({
                            commentId: commentId,
                            userId: sessionUser.data.user.id,
                        });

                        if (result.data?.deleted) {
                            setLikeReaction(undefined);
                            setDislikeReaction(undefined);
                            decrementLike();
                        } else if (result.data?.liked) {
                            if (dislikeReaction) {
                                setDislikeReaction(false);
                                decrementDislike();
                            }
                            setLikeReaction(true);
                            incrementLike();
                        }
                    }
                }}
                disabled={isPendingDislikeComment || !sessionUser.data?.user.id}
                loading={isPendingLikeComment}
                size={"md"}
                title={likeReaction ? "remove like" : "like"}
            >
                {likeReaction ? (
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
                    if (sessionUser.data?.user.id) {
                        const result = await executeAsyncDislikeComment({
                            commentId: commentId,
                            userId: sessionUser.data.user.id,
                        });

                        if (result.data?.deleted) {
                            setDislikeReaction(undefined);
                            setLikeReaction(undefined);
                            decrementDislike();
                        } else if (result.data?.disliked) {
                            if (likeReaction) {
                                setLikeReaction(false);
                                decrementLike();
                            }
                            setDislikeReaction(true);
                            incrementDislike();
                        }
                    }
                }}
                disabled={isPendingLikeComment || !sessionUser.data?.user.id}
                loading={isPendingDislikeComment}
                size={"md"}
                title={dislikeReaction ? "remove dislike" : "dislike"}
            >
                {dislikeReaction ? (
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
