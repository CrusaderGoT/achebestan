"use client";

import { CommentSelectType } from "@/zod-schemas/story";
import {
    Avatar,
    Box,
    Divider,
    Group,
    Stack,
    Text,
    Tree,
    TreeNodeData,
} from "@mantine/core";
import { IconChevronDown, IconUser } from "@tabler/icons-react";

type CommentWithCommentsProps = CommentSelectType & {
    childComments?: CommentSelectType[];
};

function commentsToTreeNodeData(comments: CommentWithCommentsProps[]) {
    const data: (TreeNodeData & CommentSelectType)[] = comments.map(
        (comment) => {
            if (!comment.childComments?.length) {
                return {
                    value: `${comment.id}`,
                    label: comment.text,
                    ...comment,
                };
            } else {
                return {
                    value: `${comment.id}`,
                    label: comment.text,
                    children: commentsToTreeNodeData(comment.childComments),
                    ...comment,
                };
            }
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

    return (
        <Tree
            data={commentsNodeData}
            levelOffset={23}
            renderNode={({ node, expanded, hasChildren, elementProps }) => {
                const comment = commentsNodeData.find(
                    (data) => data.id === Number(node.value)
                );
                return (
                    <Stack gap={2}>
                        <Group align="flex-start">
                            <Avatar size="sm">
                                <IconUser />
                            </Avatar>

                            <Stack gap={1}>
                                {comment?.edited ? (
                                    <Text>
                                        edited: {comment.edited.toDateString()}
                                    </Text>
                                ) : (
                                    comment?.created && (
                                        <Text>
                                            created:{" "}
                                            {comment.created.toDateString()}
                                        </Text>
                                    )
                                )}

                                <Text>{node.label}</Text>
                            </Stack>

                            {!hasChildren && (
                                <Box {...elementProps}>
                                    <IconChevronDown
                                        size={18}
                                        style={{
                                            transform: expanded
                                                ? "rotate(180deg)"
                                                : "rotate(0deg)",
                                        }}
                                    />
                                </Box>
                            )}
                        </Group>

                        <Group>reply | delete | report</Group>

                        <Divider mb={20} />
                    </Stack>
                );
            }}
        />
    );
}
