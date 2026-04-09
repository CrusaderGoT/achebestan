"use client";

import { CommentTreeProps } from "@/types/comment";
import { Avatar, Button, Group, Text } from "@mantine/core";
import {
    IconChevronDown,
    IconExternalLink,
    IconUser,
} from "@tabler/icons-react";
import dayjs from "dayjs";

import { CommentTreeUtils } from "@/lib/utils/comment/comments-tree-utils";
import relativeTime from "dayjs/plugin/relativeTime";
import { AuthorIcon } from "../ui/misc";

dayjs.extend(relativeTime);

function CommentHeader({
    ...props
}: CommentTreeProps & { storyAuthorId?: string }) {
    return (
        <>
            <Text size="xs" c="dimmed">
                {props.user?.name || props.userId}
            </Text>

            <Text size="xs" c="dimmed">
                {props.edited
                    ? `edited ${dayjs(props.edited).fromNow()}`
                    : props.created
                      ? `${dayjs(props.created).fromNow()}`
                      : ""}
            </Text>

            {props.userId === props.storyAuthorId && <AuthorIcon />}
        </>
    );
}

// Component for comment header
export function CommentNodeHeader({
    comment,
    hasChildren,
    expanded,
    level,
    onToggleExpand,
    onOpenDrawer,
    storyAuthorId,
}: {
    comment: CommentTreeProps;
    hasChildren: boolean;
    expanded: boolean;
    level: number;
    isInDrawer: boolean;
    onToggleExpand: () => void;
    onOpenDrawer: () => void;
    storyAuthorId?: string;
}) {
    const showDrawerButton = CommentTreeUtils.shouldShowDrawerButton(
        level,
        hasChildren,
    );

    return (
        <Group
            align="flex-start"
            gap="xs"
            onClick={(e) => {
                if (!showDrawerButton) {
                    onToggleExpand();
                } else {
                    e.stopPropagation();
                    onOpenDrawer();
                }
            }}
        >
            <Avatar size="sm">
                <IconUser />
            </Avatar>

            {!comment.hasBeenDeleted ? (
                <CommentHeader {...comment} storyAuthorId={storyAuthorId} />
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

            {hasChildren && !showDrawerButton && (
                <IconChevronDown
                    size={18}
                    style={{
                        cursor: "pointer",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                    }}
                />
            )}

            {showDrawerButton && (
                <Button
                    variant="subtle"
                    size="compact-xs"
                    leftSection={<IconExternalLink size={14} />}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenDrawer();
                    }}
                >
                    View thread
                </Button>
            )}
        </Group>
    );
}
