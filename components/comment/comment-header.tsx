"use client";

import { CommentTreeProps } from "@/lib/types/comment";
import { Text } from "@mantine/core";
import dayjs from "dayjs";

import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function CommentHeader({ ...props }: CommentTreeProps) {
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
        </>
    );
}
