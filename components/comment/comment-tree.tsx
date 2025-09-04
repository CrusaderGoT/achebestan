"use client";

import commentTreeStyles from "@/styles/comment-tree.module.css";
import publicStyles from "@/styles/public.module.css";
import cx from "clsx";

import {
    Avatar,
    Box,
    Button,
    Group,
    Rating,
    Stack,
    Text,
    Tree,
    TreeNodeData,
    useTree,
} from "@mantine/core";

import { IconChevronDown, IconUser } from "@tabler/icons-react";

import { useMemo, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { useFocusTrap } from "@mantine/hooks";

import { CommentForm } from "../forms/comment/comment-form";

import { useDeleteComment } from "@/lib/hooks/comment/comment-hook";
import { CommentSelectType } from "@/zod-schemas/comment";
import { RatingSelectType } from "@/zod-schemas/rating";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type CommentTreeProps = CommentSelectType & {
    childComments?: CommentSelectType[] | null;
    rating?: RatingSelectType | null;
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
            rating: comment.rating || null,
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
): (TreeNodeData & CommentSelectType & { rating?: RatingSelectType | null })[] {
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
    comments: (TreeNodeData &
        CommentSelectType & { rating?: RatingSelectType | null })[],
    map: Map<string, CommentSelectType & { rating?: RatingSelectType | null }>
) => {
    comments.forEach((comment) => {
        map.set(comment.value, comment);
        if (comment.children) {
            flattenComments(
                comment.children as (TreeNodeData &
                    CommentSelectType & { rating?: RatingSelectType | null })[],
                map
            );
        }
    });
};

export function CommentTree({ comments }: { comments: CommentTreeProps[] }) {
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

    // Memoize the hierarchical comments and tree data
    const commentsNodeData = useMemo(() => {
        const hierarchicalComments = buildCommentHierarchy(comments);
        return commentsToTreeNodeData(hierarchicalComments);
    }, [comments]);

    // Memoize the commentMap to prevent infinite re-renders
    const commentMap = useMemo(() => {
        const map = new Map<
            string,
            CommentSelectType & { rating?: RatingSelectType | null }
        >();
        flattenComments(commentsNodeData, map);
        return map;
    }, [commentsNodeData]);

    const handleReplyToggle = (commentId: number) => {
        setActiveReplyId(activeReplyId === commentId ? null : commentId);
    };

    const handleCloseReply = () => {
        setActiveReplyId(null);
    };

    const focusTrapRef = useFocusTrap();

    const tree = useTree({ multiple: false });

    const { data: session } = authClient.useSession();

    const {
        executeAsync: executeAsyncDeleteComment,
        isPending: isPendingDeleteComment,
    } = useDeleteComment();

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
                const isReplyOpen = activeReplyId === Number(node.value);

                if (!comment) {
                    return null; // Safety check
                }

                return (
                    <Box
                        {...elementProps}
                        className={cx(
                            level > 1 && commentTreeStyles.childCommentLine
                        )}
                        style={{
                            marginLeft: `${(level - 1) * 23}px`,
                        }}
                    >
                        <Stack gap={2} p="sm">
                            <Group
                                align="flex-start"
                                gap="xs"
                                onClick={() => tree.toggleExpanded(node.value)}
                            >
                                <Avatar size="sm">
                                    <IconUser />
                                </Avatar>

                                <Stack gap={4} flex={1}>
                                    <Group gap="xs" align="center">
                                        <Text size="xs" c="dimmed">
                                            {comment.hasBeenDeleted
                                                ? "[deleted]"
                                                : comment.userId}
                                        </Text>

                                        <Text size="xs" c="dimmed">
                                            {comment.hasBeenDeleted
                                                ? "deleted"
                                                : comment.edited
                                                ? `edited ${dayjs(
                                                      comment.edited
                                                  ).fromNow()}`
                                                : comment.created
                                                ? `created ${dayjs(
                                                      comment.created
                                                  ).fromNow()}`
                                                : ""}
                                        </Text>
                                    </Group>

                                    {comment.rating?.stars && (
                                        <Rating
                                            defaultValue={comment.rating.stars}
                                            readOnly
                                            fractions={2}
                                        />
                                    )}

                                    <Text size="sm">
                                        {comment.hasBeenDeleted
                                            ? "Deleted"
                                            : node.label}
                                    </Text>
                                </Stack>

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

                            {!comment.hasBeenDeleted && (
                                <Group gap="xs" ml={28}>
                                    <Button
                                        variant="subtle"
                                        size="xs"
                                        onClick={() =>
                                            handleReplyToggle(comment.id)
                                        }
                                    >
                                        {isReplyOpen ? "Cancel" : "Reply"}
                                    </Button>

                                    {session?.user.id === comment.userId ? (
                                        <Button
                                            variant="subtle"
                                            size="xs"
                                            onClick={async () =>
                                                await executeAsyncDeleteComment(
                                                    {
                                                        commentId: comment.id,
                                                        userId: comment.userId,
                                                        storyISBN:
                                                            comment.storyISBN,
                                                    }
                                                )
                                            }
                                            disabled={isPendingDeleteComment}
                                            title="Delete Comment"
                                        >
                                            Delete
                                        </Button>
                                    ) : null}
                                </Group>
                            )}

                            {isReplyOpen && !comment.hasBeenDeleted && (
                                <Box ml={28} mt="xs" ref={focusTrapRef}>
                                    <CommentForm
                                        storyISBN={comment.storyISBN}
                                        text=""
                                        parentCommentId={comment.id}
                                        placeholder={`Reply to ${comment.userId}`}
                                        closeCommentForm={handleCloseReply}
                                        onClick={(e) => e.currentTarget.focus()}
                                    />
                                </Box>
                            )}
                        </Stack>
                    </Box>
                );
            }}
        />
    );
}
