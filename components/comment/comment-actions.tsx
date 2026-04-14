"use client";

import {
    useDeleteComment,
    useDeleteCommentThread,
} from "@/lib/hooks/comment/comment-action-hooks";
import { CommentActionsProps } from "@/types/comment";
import { Button, Group } from "@mantine/core";
import {
    IconEdit,
    IconMessageReply,
    IconNeedleThread,
    IconTrash,
    IconTrashX,
} from "@tabler/icons-react";

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
    hasBeenDeleted,
    permissions,
}: CommentActionsProps) {
    // Use pre-calculated permissions with fallback
    const perms = permissions ?? {
        canDeleteOwn: false,
        canDeleteAll: false,
        canUpdate: false,
        canCreate: false,
    };

    if (hasBeenDeleted && !perms.canDeleteAll) return null;

    return (
        <Group gap="xs">
            {!hasBeenDeleted && (
                <>
                    {perms.canCreate && (
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

                    {perms.canUpdate && (
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
                canDeleteOwn={perms.canDeleteOwn}
                canDeleteAll={perms.canDeleteAll}
                hasBeenDeleted={hasBeenDeleted}
            />
        </Group>
    );
}

type DeleteCommentProps = Pick<
    CommentActionsProps,
    "commentId" | "commentUserId" | "storyISBN" | "hasBeenDeleted"
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
