"use client";

import { CommentSelectType } from "@/zod-schemas/story";
import {
    Avatar,
    Box,
    Button,
    Divider,
    Group,
    Stack,
    Text,
    Tree,
    TreeNodeData,
} from "@mantine/core";
import { IconChevronDown, IconUser } from "@tabler/icons-react";
import cx from "clsx";
import { useState } from "react";
import { CommentForm } from "../forms/comment/comment-form";

type CommentWithCommentsProps = CommentSelectType & {
    childComments?: CommentSelectType[];
};

function commentsToTreeNodeData(comments: CommentWithCommentsProps[]) {
    // Filter out comments that have a parentId (child comments) - they should only appear as children
    const topLevelComments = comments.filter(comment => !comment.parentCommentId);
    
    const data: (TreeNodeData & CommentSelectType)[] = topLevelComments.map(
        (comment) => {
            const baseNode = {
                value: `${comment.id}`,
                label: comment.text,
                ...comment,
            };

            if (comment.childComments?.length) {
                return {
                    ...baseNode,
                    children: commentsToTreeNodeData(comment.childComments),
                };
            }

            return baseNode;
        }
    );
    return data;
}

export function CommentTree({
    comments,
}: {
    comments: CommentWithCommentsProps[];
}) {
    const commentsNodeData = commentsToTreeNodeData(comments);
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

    // Create a flattened map for quick lookups
    const commentMap = new Map<string, CommentSelectType>();
    
    const flattenComments = (comments: (TreeNodeData & CommentSelectType)[]) => {
        comments.forEach(comment => {
            commentMap.set(comment.value, comment);
            if (comment.children) {
                flattenComments(comment.children as (TreeNodeData & CommentSelectType)[]);
            }
        });
    };
    
    flattenComments(commentsNodeData);

    const handleReplyToggle = (commentId: number) => {
        setActiveReplyId(activeReplyId === commentId ? null : commentId);
    };

    const handleCloseReply = () => {
        setActiveReplyId(null);
    };

    return (
        <Tree
            data={commentsNodeData}
            levelOffset={23}
            renderNode={({ node, expanded, hasChildren, elementProps }) => {
                const comment = commentMap.get(node.value);
                const isReplyOpen = activeReplyId === Number(node.value);
                
                if (!comment) {
                    return null; // Safety check
                }

                return (
                    <Stack gap={2} p="sm" {...elementProps}>
                        <Group align="flex-start" gap="xs">
                            <Avatar size="sm">
                                <IconUser />
                            </Avatar>

                            <Stack gap={4} flex={1}>
                                <Group gap="xs" align="center">
                                    <Text size="xs" c="dimmed">
                                        {comment.userId}
                                    </Text>
                                    
                                    <Text size="xs" c="dimmed">
                                        {comment.edited 
                                            ? `edited: ${comment.edited.toLocaleDateString()}` 
                                            : comment.created 
                                                ? `created: ${comment.created.toLocaleDateString()}`
                                                : ''
                                        }
                                    </Text>
                                </Group>
                                
                                <Text size="sm">{node.label}</Text>
                            </Stack>

                            {hasChildren && (
                                <Box>
                                    <IconChevronDown
                                        size={18}
                                        style={{
                                            transform: expanded
                                                ? "rotate(180deg)"
                                                : "rotate(0deg)",
                                            transition: "transform 0.2s ease",
                                        }}
                                    />
                                </Box>
                            )}
                        </Group>

                        <Group gap="xs" ml={28}>
                            <Button
                                variant="subtle"
                                size="xs"
                                onClick={() => handleReplyToggle(comment.id)}
                            >
                                {isReplyOpen ? "Cancel" : "Reply"}
                            </Button>
                        </Group>

                        {isReplyOpen && (
                            <Box ml={28} mt="xs">
                                <CommentForm
                                    storyISBN={comment.storyISBN}
                                    text=""
                                    parentCommentId={comment.id}
                                    placeholder={`Reply to ${comment.userId}`}
                                    closeCommentForm={handleCloseReply}
                                />
                            </Box>
                        )}

                        <Divider />
                    </Stack>
                );
            }}
        />
    );
}