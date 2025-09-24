"use client";

import { authClient } from "@/lib/auth-client";
import { useUpdateComment } from "@/lib/hooks/comment/comment-action-hooks";
import {
    CommentInteractionHandlers,
    CommentNodeProps,
    CommentRenderContext,
} from "@/lib/types/comment";
import { Box, Collapse, Stack } from "@mantine/core";
import { useEffect } from "react";
import { CreateCommentForm } from "../forms/comment/create-comment-form";
import { CommentActions } from "./comment-actions";
import { CommentContent } from "./comment-content";
import { CommentNodeHeader } from "./comment-header";
import { LikeDislikeButton } from "./like-dislike-btns";

import { CommentTreeUtils } from "@/lib/utils/helpers";

// Main comment node renderer
export function CommentNode({
    nodeProps,
    context,
    interactions,
    session,
}: {
    nodeProps: CommentNodeProps;
    context: CommentRenderContext;
    interactions: CommentInteractionHandlers;
    session: ReturnType<typeof authClient.useSession>["data"];
}) {
    const { node, expanded, hasChildren, elementProps, level } = nodeProps;
    const { isInDrawer, tree, commentMap, onOpenDrawer } = context;
    const {
        activeReplyId,
        activeEditId,
        handleReplyToggle,
        handleEditToggle,
        handleCloseEdit,
        handleCloseReply,
        focusTrapRef,
    } = interactions;

    const comment = commentMap.get(node.value);
    const { isPending: isPendingUpdateComment } = useUpdateComment();

    const showDrawerButton = CommentTreeUtils.shouldShowDrawerButton(
        level,
        hasChildren
    );

    useEffect(() => {
        if (expanded && showDrawerButton) {
            tree.collapse(node.value);
        }
    }, [expanded, showDrawerButton, tree, node.value]);

    if (!comment) return null;

    const isReplyOpen = activeReplyId === Number(node.value);
    const isEditOpen = activeEditId === comment.id;

    const likes = comment.reactions?.filter((r) => r.liked).length;
    const dislikes = comment.reactions?.filter((r) => r.disliked).length;
    const userReaction = comment.reactions
        ?.filter((r) => r.userId === session?.user.id)
        .pop();

    const handleToggleExpand = () => {
        tree.toggleExpanded(node.value);
        if (comment.childComments && !showDrawerButton) {
            comment.childComments
                .slice(1, 10)
                .filter((c) => !c.hasBeenDeleted)
                .forEach((c) => tree.expand(c.id.toString()));
        }
    };

    return (
        <Stack gap={2} p="sm" {...elementProps}>
            <CommentNodeHeader
                comment={comment}
                hasChildren={hasChildren}
                expanded={expanded}
                level={level}
                isInDrawer={isInDrawer}
                onToggleExpand={handleToggleExpand}
                onOpenDrawer={() => onOpenDrawer(comment)}
            />

            {!showDrawerButton && (
                <Collapse in={tree.expandedState[node.value]} keepMounted>
                    <Stack ml={28} gap={2}>
                        <CommentContent
                            comment={comment}
                            node={node}
                            isEditOpen={isEditOpen}
                            handleCloseEdit={handleCloseEdit}
                        />

                        {!comment.hasBeenDeleted && (
                            <LikeDislikeButton
                                commentId={comment.id}
                                likes={likes}
                                dislikes={dislikes}
                                userReaction={userReaction}
                            />
                        )}

                        {!comment.hasBeenDeleted && session?.user.id && (
                            <CommentActions
                                commentId={comment.id}
                                commentUserId={comment.userId}
                                userId={session.user.id}
                                isReplyOpen={isReplyOpen}
                                isPendingUpdateComment={isPendingUpdateComment}
                                isEditOpen={isEditOpen}
                                handleEditToggle={handleEditToggle}
                                handleReplyToggle={handleReplyToggle}
                                handleCloseEdit={handleCloseEdit}
                                handleCloseReply={handleCloseReply}
                                storyISBN={comment.storyISBN}
                            />
                        )}

                        {isReplyOpen && !comment.hasBeenDeleted && (
                            <Box ml={28} mt="xs" ref={focusTrapRef}>
                                <CreateCommentForm
                                    storyISBN={comment.storyISBN}
                                    text=""
                                    parentCommentId={comment.id}
                                    placeholder={`Reply to ${
                                        comment.user?.name || ""
                                    }`}
                                    closeCommentForm={handleCloseReply}
                                    onNewCommentAdded={tree.expand}
                                />
                            </Box>
                        )}
                    </Stack>
                </Collapse>
            )}
        </Stack>
    );
}
