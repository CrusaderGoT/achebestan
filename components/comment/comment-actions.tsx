"use client";

import { authClient } from "@/lib/auth/auth-client";
import {
    canCreateComment,
    canDeleteAllComment,
    canDeleteOwnComment,
    canUpdateComment,
} from "@/lib/auth/policies";
import {
    useDeleteComment,
    useDeleteCommentThread,
} from "@/lib/hooks/comment/comment-action-hooks";
import { CommentType } from "@/types/comment";
import { UserSelectType } from "@/types/user";
import { Button, Group } from "@mantine/core";
import {
    IconEdit,
    IconMessageReply,
    IconNeedleThread,
    IconTrash,
    IconTrashX,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

type CommentActionsProps = {
    handleCloseReply: () => void;
    handleReplyToggle: (commentId: number) => void;
    handleCloseEdit: () => void;
    handleEditToggle: (commentId: number) => void;
    isReplyOpen: boolean;
    commentId: number;
    commentUserId: string;
    isPendingUpdateComment: boolean;
    storyISBN: string;
    isEditOpen: boolean;
    session: ReturnType<typeof authClient.useSession>["data"];
    hasBeenDeleted: boolean | null;
};

export function CommentActions({
    handleCloseReply,
    handleReplyToggle,
    handleCloseEdit,
    isReplyOpen,
    commentId,
    handleEditToggle,
    commentUserId,
    isPendingUpdateComment,
    storyISBN,
    isEditOpen,
    session,
    hasBeenDeleted,
}: CommentActionsProps) {
    const noPermissions = useMemo(
        () => ({
            canDeleteOwn: false,
            canDeleteAll: false,
            canUpdate: false,
            canCreate: false,
        }),
        []
    );

    const [permissions, setPermissions] = useState(noPermissions);

    useEffect(() => {
        async function checkCommentPermissions() {
            if (!session?.user.id) {
                return noPermissions;
            }

            const comment: CommentType = {
                id: commentId,
                userId: commentUserId,
            };

            const [canDeleteAll, canDeleteOwn, canUpdate, canCreate] =
                await Promise.all([
                    await canDeleteAllComment(
                        session.user as UserSelectType,
                        comment
                    ),
                    await canDeleteOwnComment(
                        session.user as UserSelectType,
                        comment
                    ),
                    await canUpdateComment(
                        session.user as UserSelectType,
                        comment
                    ),
                    await canCreateComment(),
                ]);

            return {
                canDeleteOwn: canDeleteOwn,
                canDeleteAll: canDeleteAll,
                canUpdate: canUpdate,
                canCreate: canCreate,
            };
        }
        checkCommentPermissions().then(setPermissions);
    }, [session?.user, noPermissions, commentId, commentUserId]);

    if (hasBeenDeleted && !permissions.canDeleteAll) return null;

    return (
        <Group gap="xs">
            {!hasBeenDeleted && (
                <>
                    {permissions.canCreate && (
                        <Button
                            variant="subtle"
                            size="xs"
                            onClick={() => {
                                handleCloseEdit();
                                handleReplyToggle(commentId);
                            }}
                            leftSection={<IconMessageReply size={15} />}
                        >
                            {isReplyOpen ? "Cancel" : "Reply"}
                        </Button>
                    )}

                    {permissions.canUpdate && (
                        <Button
                            variant="subtle"
                            color="yellow"
                            size="xs"
                            leftSection={<IconEdit size={15} />}
                            onClick={() => {
                                handleCloseReply();
                                handleEditToggle(commentId);
                            }}
                            disabled={isPendingUpdateComment}
                            title="Edit Comment"
                        >
                            {isEditOpen ? "Cancel" : "Edit"}
                        </Button>
                    )}
                </>
            )}

            <DeleteComment
                commentId={commentId}
                commentUserId={commentUserId}
                storyISBN={storyISBN}
                canDeleteOwn={permissions.canDeleteOwn}
                canDeleteAll={permissions.canDeleteAll}
                session={session}
                hasBeenDeleted={hasBeenDeleted}
            />
        </Group>
    );
}

type DeleteCommentProps = Pick<
    CommentActionsProps,
    "commentId" | "commentUserId" | "storyISBN" | "session" | "hasBeenDeleted"
> & { canDeleteOwn: boolean; canDeleteAll: boolean };

export function DeleteComment({ ...props }: DeleteCommentProps) {
    const {
        executeAsync: executeAsyncDeleteCommentThread,
        isPending: isPendingDeleteCommentTree,
    } = useDeleteCommentThread();

    const {
        executeAsync: executeAsyncDeleteComment,
        isPending: isPendingDeleteComment,
    } = useDeleteComment();

    if (!props.canDeleteOwn && !props.canDeleteAll) return null;

    return (
        <Group>
            {!props.hasBeenDeleted && (
                <Button
                    variant="subtle"
                    size="xs"
                    color="red"
                    leftSection={<IconTrashX size={15} />}
                    onClick={async () =>
                        await executeAsyncDeleteComment({
                            commentId: props.commentId,
                            userId: props.commentUserId,
                            storyISBN: props.storyISBN,
                        })
                    }
                    disabled={isPendingDeleteComment}
                    title="Delete Comment"
                >
                    Delete
                </Button>
            )}

            {props.canDeleteAll && (
                <Button
                    variant="subtle"
                    size="xs"
                    color="violet"
                    rightSection={
                        <>
                            <IconTrash size={15} />
                            <IconNeedleThread size={15} />
                        </>
                    }
                    onClick={async () =>
                        await executeAsyncDeleteCommentThread({
                            commentId: props.commentId,
                            userId: props.commentUserId,
                            storyISBN: props.storyISBN,
                        })
                    }
                    disabled={isPendingDeleteCommentTree}
                    title="Delete Comment"
                >
                    Delete Thread
                </Button>
            )}
        </Group>
    );
}
