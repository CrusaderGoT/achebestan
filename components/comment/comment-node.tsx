"use client";

import { authClient } from "@/lib/auth-client";
import { useUpdateComment } from "@/lib/hooks/comment/comment-action-hooks";
import {
    CommentInteractionHandlers,
    CommentNodeProps,
    CommentRenderContext,
} from "@/lib/types/comment";
import commentTreeStyles from "@/styles/comment-tree.module.css";
import { Box, Collapse, Stack } from "@mantine/core";
import cx from "clsx";
import { useEffect } from "react";
import { LikeDislikeButton } from "../buttons/comment/like-dislike-btns";
import { CreateCommentForm } from "../forms/comment/create-comment-form";
import { CommentActions } from "./comment-actions";
import { CommentContent } from "./comment-content";
import { CommentNodeHeader } from "./comment-header";

import { CommentTreeUtils } from "@/lib/utils/helpers";
import { useElementSize } from "@mantine/hooks";

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

    const { ref, height } = useElementSize();

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
        if (node.children && !showDrawerButton) {
            node.children.forEach((c) => tree.expand(c.value));
        }
    };

    return (
        <Stack
            ref={ref}
            gap={2}
            p="sm"
            {...elementProps}
            className={cx(
                level > 1 && commentTreeStyles.childCommentLine
                // hasChildren && expanded && commentTreeStyles.parentCommentLine
            )}
            style={{
                marginLeft: `${CommentTreeUtils.calculateIndentation(
                    level,
                    isInDrawer
                )}px`,
                ["--hook-height"]: expanded
                    ? `${height - 13}px`
                    : `${height + 70}px`,
            }}
        >
            <CommentNodeHeader
                comment={comment}
                hasChildren={hasChildren}
                expanded={expanded}
                level={level}
                isInDrawer={isInDrawer}
                onToggleExpand={handleToggleExpand}
                onOpenDrawer={() => onOpenDrawer(node.value)}
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
