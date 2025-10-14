"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useUpdateComment } from "@/lib/hooks/comment/comment-action-hooks";
import {
    CommentInteractionHandlers,
    CommentNodeProps,
    CommentRenderContext,
} from "@/types/comment";
import { Box, Collapse, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { CreateCommentForm } from "../forms/comment/create-comment-form";
import { CommentActions } from "./comment-actions";
import { CommentContent } from "./comment-content";
import { CommentNodeHeader } from "./comment-header";
import { LikeDislikeButton } from "./like-dislike-btns";

import { CommentTreeUtils } from "@/lib/utils/comment/comments-tree-utils";

import { CommentPolicy } from "@/lib/auth/policies/comment-policy";
import commentTreeStyles from "@/styles/comment-tree.module.css";
import { UserSelectType } from "@/zod-schemas/user";
import cx from "clsx";
import { DRAWER_CONFIG } from "./comment-tree";

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

    const [permissions, setPermissions] = useState({
        canDelete: false,
        canUpdate: false,
        canCreate: false,
    });

    useEffect(() => {
        async function checkCommentPermissions() {
            if (!session?.user) {
                return {
                    canDelete: false,
                    canUpdate: false,
                    canCreate: false,
                };
            }

            const policy = await CommentPolicy.create(
                session.user as UserSelectType
            );

            return {
                canDelete: await policy.canDelete(),
                canUpdate: await policy.canUpdate(),
                canCreate: await policy.canCreate(),
            };
        }
        checkCommentPermissions().then(setPermissions);
    }, [session?.user]);

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
        <Stack
            gap={2}
            p="sm"
            {...elementProps}
            className={cx(
                commentTreeStyles.comment,
                level === 1 && commentTreeStyles.topLevel,
                level === DRAWER_CONFIG.drawerLevel &&
                    commentTreeStyles.drawerLevel
            )}
        >
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
                                isReplyOpen={isReplyOpen}
                                isPendingUpdateComment={isPendingUpdateComment}
                                isEditOpen={isEditOpen}
                                handleEditToggle={handleEditToggle}
                                handleReplyToggle={handleReplyToggle}
                                handleCloseEdit={handleCloseEdit}
                                handleCloseReply={handleCloseReply}
                                storyISBN={comment.storyISBN}
                                canCreateComment={permissions.canCreate}
                                canDeleteComment={permissions.canDelete}
                                canUpdateComment={permissions.canUpdate}
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
