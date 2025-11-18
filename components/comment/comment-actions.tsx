"use client";

import { authClient } from "@/lib/auth/auth-client";
import {
    canCreateComment,
    canDeleteComment,
    canUpdateComment,
} from "@/lib/auth/policies";
import { CommentType } from "@/lib/auth/policies/comment-policy";
import { useDeleteComment } from "@/lib/hooks/comment/comment-action-hooks";
import { UserSelectType } from "@/zod-schemas/user";
import { Button, Group } from "@mantine/core";
import { IconEdit, IconMessageReply, IconTrashX } from "@tabler/icons-react";
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
}: CommentActionsProps) {
    const {
        executeAsync: executeAsyncDeleteComment,
        isPending: isPendingDeleteComment,
    } = useDeleteComment();

    const noPermissions = useMemo(
        () => ({
            canDelete: false,
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

            const [canDelete, canUpdate, canCreate] = await Promise.all([
                await canDeleteComment(session.user as UserSelectType, comment),
                await canUpdateComment(session.user as UserSelectType, comment),
                await canCreateComment(),
            ]);

            return {
                canDelete: canDelete,
                canUpdate: canUpdate,
                canCreate: canCreate,
            };
        }
        checkCommentPermissions().then(setPermissions);
    }, [session?.user, noPermissions, commentId, commentUserId]);

    return (
        <Group gap="xs">
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

            {permissions.canDelete && (
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
