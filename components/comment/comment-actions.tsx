"use client";

import { useDeleteComment } from "@/lib/hooks/comment/comment-action-hooks";
import { Button, Group } from "@mantine/core";
import { IconEdit, IconMessageReply, IconTrashX } from "@tabler/icons-react";

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
    canCreateComment: boolean;
    canDeleteComment: boolean;
    canUpdateComment: boolean;
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
    canCreateComment,
    canDeleteComment,
    canUpdateComment,
}: CommentActionsProps) {
    const {
        executeAsync: executeAsyncDeleteComment,
        isPending: isPendingDeleteComment,
    } = useDeleteComment();

    return (
        <Group gap="xs">
            {canCreateComment && (
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

            {canUpdateComment && (
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

            {canDeleteComment && (
                <Button
                    variant="subtle"
                    size="xs"
                    color="red"
                    leftSection={<IconTrashX size={15} />}
                    onClick={async () =>
                        await executeAsyncDeleteComment({
                            commentId: commentId,
                            userId: commentUserId,
                            storyISBN: storyISBN,
                        })
                    }
                    disabled={isPendingDeleteComment}
                    title="Delete Comment"
                >
                    Delete
                </Button>
            )}
        </Group>
    );
}
