"use client";

import commentTreeStyles from "@/styles/comment-tree.module.css";
import publicStyles from "@/styles/public.module.css";
import cx from "clsx";

import {
    Avatar,
    Box,
    Button,
    Collapse,
    getTreeExpandedState,
    Group,
    Rating,
    Stack,
    Text,
    Tree,
    TreeNodeData,
    useTree,
} from "@mantine/core";

import {
    IconChevronDown,
    IconEdit,
    IconMessageReply,
    IconTrashX,
    IconUser,
} from "@tabler/icons-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { useFocusTrap, useMounted } from "@mantine/hooks";

import { CreateCommentForm } from "@/components/forms/comment/create-comment-form";

import {
    useDeleteComment,
    useUpdateComment,
} from "@/lib/hooks/comment/comment-hook";
import { CommentSelectType } from "@/zod-schemas/comment";
import { RatingSelectType } from "@/zod-schemas/rating";
import { ReactionSelectType } from "@/zod-schemas/reaction";
import { userSelectType } from "@/zod-schemas/user";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LikeDislikeButton } from "../buttons/comment/like-dislike-btns";
import { UpdateCommentForm } from "../forms/comment/update-comment-form";

dayjs.extend(relativeTime);

type CommentTreeProps = CommentSelectType & {
    childComments?: CommentSelectType[] | null;
    rating?: RatingSelectType | null;
    user?: userSelectType | null;
    reactions?: ReactionSelectType[] | null;
};

function buildCommentHierarchy(
    comments: CommentTreeProps[]
): CommentTreeProps[] {
    const commentMap = new Map<number, CommentTreeProps>();
    const topLevel: CommentTreeProps[] = [];

    // First pass: create all comment objects
    comments.forEach((comment) => {
        commentMap.set(comment.id, {
            ...comment,
            childComments: [],
            rating: comment.rating,
            user: comment.user,
        });
    });

    // Second pass: build hierarchy
    comments.forEach((comment) => {
        const commentWithChildren = commentMap.get(comment.id)!;

        if (comment.parentCommentId) {
            // This is a child comment
            const parent = commentMap.get(comment.parentCommentId);
            if (parent) {
                parent.childComments = parent.childComments || [];
                parent.childComments.push(commentWithChildren);
            }
        } else {
            // This is a top-level comment
            topLevel.push(commentWithChildren);
        }
    });

    return topLevel;
}

function commentsToTreeNodeData(
    comments: CommentTreeProps[]
): (TreeNodeData & CommentTreeProps)[] {
    return comments.map((comment) => {
        const baseNode = {
            value: `${comment.id}`,
            label: comment.text,
            ...comment,
            rating: comment.rating,
        };

        if (comment.childComments?.length) {
            return {
                ...baseNode,
                children: commentsToTreeNodeData(comment.childComments),
            };
        }

        return baseNode;
    });
}

// Move flattenComments outside the component to avoid dependency issues
const flattenComments = (
    comments: (TreeNodeData & CommentTreeProps)[],
    map: Map<string, CommentTreeProps>
) => {
    comments.forEach((comment) => {
        map.set(comment.value, comment);
        if (comment.children) {
            flattenComments(
                comment.children as (TreeNodeData & CommentTreeProps)[],
                map
            );
        }
    });
};

export function CommentTree({ comments }: { comments: CommentTreeProps[] }) {
    // Memoize the hierarchical comments and tree data
    const commentsNodeData = useMemo(() => {
        const hierarchicalComments = buildCommentHierarchy(comments);
        return commentsToTreeNodeData(hierarchicalComments);
    }, [comments]);

    // Memoize the commentMap to prevent infinite re-renders
    const commentMap = useMemo(() => {
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

    const focusTrapRef = useFocusTrap();

    const { data: session } = authClient.useSession();

    const {
        executeAsync: executeAsyncDeleteComment,
        isPending: isPendingDeleteComment,
    } = useDeleteComment();

    const { isPending: isPendingUpdateComment } = useUpdateComment();

    const mounted = useMounted();

    // make new comments expand

    const prevCommentsRef = useRef<CommentTreeProps[]>([]);
    const autoExpandedRef = useRef(new Set()); // Track auto-expanded comments

    const commentsToExpand = useMemo(() => {
        const prevCommentIds = new Set(
            prevCommentsRef.current.map((c) => c.id)
        );

        const newComments = commentsNodeData.filter(
            (c) => !prevCommentIds.has(c.id) && !c.parentCommentId
        );

        prevCommentsRef.current = commentsNodeData;

        return newComments.map((c) => c.value);
    }, [commentsNodeData]);

    const tree = useTree({
        multiple: false,
        initialExpandedState: getTreeExpandedState(
            commentsNodeData,
            commentsToExpand
        ),
    });

    // Only expand new comments once
    useEffect(() => {
        commentsToExpand.forEach((commentId) => {
            // Only expand if we haven't auto-expanded it before AND it's not currently expanded
            if (
                !autoExpandedRef.current.has(commentId) &&
                !tree.expandedState[commentId]
            ) {
                tree.expand(commentId);
                autoExpandedRef.current.add(commentId); // Mark as auto-expanded
            }
        });
    }, [commentsToExpand, tree]);

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
                                <>
                                    <Text size="xs" c="dimmed">
                                        {comment.user?.name || comment.userId}
                                    </Text>

                                    <Text size="xs" c="dimmed">
                                        {comment.edited
                                            ? `edited ${dayjs(
                                                  comment.edited
                                              ).fromNow()}`
                                            : comment.created
                                            ? `${dayjs(
                                                  comment.created
                                              ).fromNow()}`
                                            : ""}
                                    </Text>
                                </>
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
                                        <Group gap="xs">
                                            <Button
                                                variant="subtle"
                                                size="xs"
                                                onClick={() => {
                                                    handleCloseEdit();
                                                    handleReplyToggle(
                                                        comment.id
                                                    );
                                                }}
                                                leftSection={
                                                    <IconMessageReply
                                                        size={15}
                                                    />
                                                }
                                            >
                                                {isReplyOpen
                                                    ? "Cancel"
                                                    : "Reply"}
                                            </Button>

                                            {session.user.id ===
                                            comment.userId ? (
                                                <>
                                                    <Button
                                                        variant="subtle"
                                                        color="yellow"
                                                        size="xs"
                                                        leftSection={
                                                            <IconEdit
                                                                size={15}
                                                            />
                                                        }
                                                        onClick={() => {
                                                            handleCloseReply();
                                                            handleEditToggle(
                                                                comment.id
                                                            );
                                                        }}
                                                        disabled={
                                                            isPendingUpdateComment
                                                        }
                                                        title="Edit Comment"
                                                    >
                                                        {isEditOpen
                                                            ? "Cancel"
                                                            : "Edit"}
                                                    </Button>

                                                    <Button
                                                        variant="subtle"
                                                        size="xs"
                                                        color="red"
                                                        leftSection={
                                                            <IconTrashX
                                                                size={15}
                                                            />
                                                        }
                                                        onClick={async () =>
                                                            await executeAsyncDeleteComment(
                                                                {
                                                                    commentId:
                                                                        comment.id,
                                                                    userId: comment.userId,
                                                                    storyISBN:
                                                                        comment.storyISBN,
                                                                }
                                                            )
                                                        }
                                                        disabled={
                                                            isPendingDeleteComment
                                                        }
                                                        title="Delete Comment"
                                                    >
                                                        Delete
                                                    </Button>
                                                </>
                                            ) : null}
                                        </Group>
                                    )}

                                {isReplyOpen && !comment.hasBeenDeleted && (
                                    <Box ml={28} mt="xs" ref={focusTrapRef}>
                                        <CreateCommentForm
                                            storyISBN={comment.storyISBN}
                                            text=""
                                            parentCommentId={comment.id}
                                            placeholder={`Reply to ${comment.userId}`}
                                            closeCommentForm={handleCloseReply}
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
