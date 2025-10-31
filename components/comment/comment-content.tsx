"use client";

import { CommentTreeProps } from "@/types/comment";
import { Rating, Stack, Text, TreeNodeData } from "@mantine/core";
import { UpdateCommentForm } from "../forms/comment/update-comment-form";

// Component for comment content

export function CommentContent({
    comment,
    node,
    isEditOpen,
    handleCloseEdit,
}: {
    comment: CommentTreeProps;
    node: TreeNodeData;
    isEditOpen: boolean;
    handleCloseEdit: () => void;
}) {
    if (comment.hasBeenDeleted) {
        return <Text size="sm">Deleted</Text>;
    }

    return (
        <Stack gap={4} flex={1}>
            {comment.rating?.stars && (
                <Rating
                    defaultValue={comment.rating.stars}
                    readOnly
                    fractions={2}
                    size="xs"
                />
            )}

            <Text size="sm">
                {isEditOpen ? (
                    <UpdateCommentForm
                        text={comment.text}
                        commentId={comment.id}
                        storyISBN={comment.storyISBN}
                        userId={comment.userId}
                        closeCommentForm={handleCloseEdit}
                    />
                ) : (
                    node.label
                )}
            </Text>
        </Stack>
    );
}
