"use client";

import commentTreeStyles from "@/styles/comment-tree.module.css";
import publicStyles from "@/styles/public.module.css";
import cx from "clsx";

import {
    Avatar,
    Box,
    Collapse,
    getTreeExpandedState,
    Group,
    Rating,
    Stack,
    Text,
    Tree,
    useTree,
} from "@mantine/core";

import { IconChevronDown, IconUser } from "@tabler/icons-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { useFocusTrap, useMounted } from "@mantine/hooks";

import { CreateCommentForm } from "@/components/forms/comment/create-comment-form";

import { useUpdateComment } from "@/lib/hooks/comment/comment-hook";
import dayjs from "dayjs";
import { LikeDislikeButton } from "../buttons/comment/like-dislike-btns";
import { UpdateCommentForm } from "../forms/comment/update-comment-form";

import {
    CommentsToTreeNodeDataType,
    CommentTreeProps,
} from "@/lib/types/comment";

import {
    buildCommentHierarchy,
    commentsToTreeNodeData,
    flattenComments,
} from "@/lib/utils/helpers";

import { CommentActions } from "./comment-actions";
import { CommentHeader } from "./comment-header";

import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function CommentTree({ comments }: { comments: CommentTreeProps[] }) {
    // Memoize the hierarchical comments and tree data
    const commentsNodeData = useMemo<CommentsToTreeNodeDataType>(() => {
        const hierarchicalComments = buildCommentHierarchy(comments);
        return commentsToTreeNodeData(hierarchicalComments);
    }, [comments]);

    // Memoize the commentMap to prevent infinite re-renders
    const commentMap = useMemo<Map<string, CommentTreeProps>>(() => {
        const map = new Map<string, CommentTreeProps>();
        flattenComments(commentsNodeData, map);
        return map;
    }, [commentsNodeData]);

    // reply state handler

    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

    const handleReplyToggle = (commentId: number) => {
        setActiveReplyId(activeReplyId === commentId ? null : commentId);
    };

    const handleCloseReply = () => {
        setActiveReplyId(null);
    };

    // edit comment state handler

    const [activeEditId, setActiveEditId] = useState<number | null>(null);

    const handleEditToggle = (commentId: number) => {
        setActiveEditId(activeEditId === commentId ? null : commentId);
    };

    const handleCloseEdit = () => {
        setActiveEditId(null);
    };

    const focusTrapRef = useFocusTrap(); // for focusing on the reply comment text area

    const { data: session } = authClient.useSession();

    const { isPending: isPendingUpdateComment } = useUpdateComment();

    const mounted = useMounted();

    // For initial expansion - only top-level comments
    const initialCommentsToExpand = useMemo<string[]>(() => {
        return commentsNodeData
            .slice(0, 10) // first 10
            .filter((c) => !c.parentCommentId) // Only top-level comments
            .map((c) => c.value);
    }, [commentsNodeData]);

    const tree = useTree({
        multiple: false,
        initialExpandedState: getTreeExpandedState(
            commentsNodeData,
            initialCommentsToExpand // Only top-level for initial expansion
        ),
    });

    // make new top-level comments auto expand, since tree is not available to that form @StoryActions

    const prevCommentsRef = useRef<CommentsToTreeNodeDataType>([]);
    const autoExpandedRef = useRef(new Set()); // Track auto-expanded comments, to prevent re-renders

    // For auto-expansion of top-level
    const newCommentsToExpand = useMemo(() => {
        const prevCommentIds = new Set(
            prevCommentsRef.current.map((c) => c.id)
        );

        // Find ALL new top-level comments
        const newComments = commentsNodeData.filter(
            (c) => !prevCommentIds.has(c.id) && !c.parentCommentId
        );

        prevCommentsRef.current = commentsNodeData;

        return newComments.map((c) => c.value);
    }, [commentsNodeData]);

    // Auto-expand ALL new comments (top-level and children)
    useEffect(() => {
        newCommentsToExpand.forEach((commentId) => {
            // Only expand if we haven't auto-expanded it before AND it's not currently expanded
            if (
                !autoExpandedRef.current.has(commentId) &&
                !tree.expandedState[commentId]
            ) {
                tree.expand(commentId);
                autoExpandedRef.current.add(commentId); // Mark as auto-expanded
            }
        });
    }, [newCommentsToExpand, tree]);

    return (
        <Tree
            data={commentsNodeData}
            tree={tree}
            levelOffset={0}
            expandOnClick={false}
            expandOnSpace={false}
            className={publicStyles.noTapHighlight}
            renderNode={({
                node,
                expanded,
                hasChildren,
                elementProps,
                level,
            }) => {
                const comment = commentMap.get(node.value);

                if (!comment || !mounted) {
                    return null; // Safety check
                }

                const isReplyOpen = activeReplyId === Number(node.value);

                const isEditOpen = activeEditId === comment.id;

                const likes = comment.reactions?.filter((r) => r.liked).length;

                const dislikes = comment.reactions?.filter(
                    (r) => r.disliked
                ).length;

                const userReaction = comment.reactions
                    ?.filter((r) => r.userId === session?.user.id)
                    .pop();

                return (
                    <Stack
                        gap={2}
                        p="sm"
                        {...elementProps}
                        className={cx(
                            level > 1 && commentTreeStyles.childCommentLine
                        )}
                        style={{
                            marginLeft: `${(level - 1) * 23}px`,
                        }}
                    >
                        <Group
                            align="flex-start"
                            gap="xs"
                            onClick={() => {
                                tree.toggleExpanded(node.value);
                                if (node.children) {
                                    node.children.forEach((c) => {
                                        tree.expand(c.value);
                                    });
                                }
                            }}
                        >
                            <Avatar size="sm">
                                <IconUser />
                            </Avatar>

                            {!comment.hasBeenDeleted ? (
                                <CommentHeader {...comment} />
                            ) : (
                                <>
                                    <Text size="xs" c="dimmed">
                                        [deleted]
                                    </Text>

                                    <Text size="xs" c="dimmed">
                                        deleted
                                    </Text>
                                </>
                            )}

                            {hasChildren && (
                                <IconChevronDown
                                    size={18}
                                    style={{
                                        transform: expanded
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)",
                                        transition: "transform 0.2s ease",
                                    }}
                                />
                            )}
                        </Group>

                        <Collapse
                            in={tree.expandedState[node.value]}
                            keepMounted
                        >
                            <Stack ml={28} gap={2}>
                                {!comment.hasBeenDeleted ? (
                                    <Stack gap={4} flex={1}>
                                        {comment.rating?.stars && (
                                            <Rating
                                                defaultValue={
                                                    comment.rating.stars
                                                }
                                                readOnly
                                                fractions={2}
                                                size={"xs"}
                                            />
                                        )}

                                        <Text size="sm">
                                            {isEditOpen ? (
                                                <UpdateCommentForm
                                                    text={comment.text}
                                                    commentId={comment.id}
                                                    storyISBN={
                                                        comment.storyISBN
                                                    }
                                                    userId={comment.userId}
                                                    closeCommentForm={
                                                        handleCloseEdit
                                                    }
                                                />
                                            ) : (
                                                node.label
                                            )}
                                        </Text>

                                        <LikeDislikeButton
                                            commentId={comment.id}
                                            likes={likes}
                                            dislikes={dislikes}
                                            userReaction={userReaction}
                                        />
                                    </Stack>
                                ) : (
                                    <Text size="sm">Deleted</Text>
                                )}

                                {!comment.hasBeenDeleted &&
                                    session?.user.id && (
                                        <CommentActions
                                            commentId={comment.id}
                                            commentUserId={comment.userId}
                                            userId={session.user.id}
                                            isReplyOpen={isReplyOpen}
                                            isPendingUpdateComment={
                                                isPendingUpdateComment
                                            }
                                            isEditOpen={isEditOpen}
                                            handleEditToggle={handleEditToggle}
                                            handleReplyToggle={
                                                handleReplyToggle
                                            }
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
                    </Stack>
                );
            }}
        />
    );
}
