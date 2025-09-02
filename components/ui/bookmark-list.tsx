// components/BookmarkList.tsx
import { Bookmark } from "@/lib/types/bookmark";
import styles from "@/styles/bookmark-list.module.css";
import {
    ActionIcon,
    Affix,
    Badge,
    Box,
    CloseButton,
    Collapse,
    Group,
    Paper,
    ScrollArea,
    Stack,
    Text,
    Tooltip,
} from "@mantine/core";
import { useClickOutside, useDisclosure } from "@mantine/hooks";
import { IconBookmarks, IconExternalLink, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface BookmarkListProps {
    bookmarks: Bookmark[];
    onBookmarkClick: (bookmark: Bookmark) => void;
    onBookmarkRemove: (id: string) => void;
}

export function BookmarkList({
    bookmarks,
    onBookmarkClick,
    onBookmarkRemove,
}: BookmarkListProps) {
    const [opened, { toggle, close }] = useDisclosure();

    const ref = useClickOutside(() => close());

    if (bookmarks.length === 0) return null;

    const formatTimestamp = (timestamp: number) => {
        const date = dayjs(timestamp);
        const now = dayjs();
        const diffMins = now.diff(date, "minute");
        const diffHours = now.diff(date, "hour");
        const diffDays = now.diff(date, "day");

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.format("L");
    };

    return (
        <Box className={styles.bookmarkListBox}>
            {!opened && (
                <ActionIcon variant="subtle" size="sm" onClick={toggle}>
                    <IconBookmarks size={16} />
                </ActionIcon>
            )}

            <Affix position={{ top: 70, bottom: 50, left: 30 }}>
                <Collapse in={opened}>
                    <Paper ref={ref} withBorder className={styles.bookmarkList}>
                        <Group justify="space-between" mb="sm">
                            <Group gap="xs">
                                <Text fw={600} size="sm">
                                    Bookmarks
                                </Text>
                                <Badge size="xs" variant="light" color="blue">
                                    {bookmarks.length}
                                </Badge>
                            </Group>

                            <CloseButton
                                variant="subtle"
                                size="sm"
                                onClick={toggle}
                            />
                        </Group>

                        <ScrollArea h={200}>
                            <Stack gap="xs">
                                {bookmarks.map((bookmark, index) => (
                                    <Paper
                                        key={bookmark.id}
                                        p="xs"
                                        withBorder
                                        radius="sm"
                                        className={styles.bookmarkItem}
                                        onClick={() =>
                                            onBookmarkClick(bookmark)
                                        }
                                    >
                                        <Group
                                            justify="space-between"
                                            align="flex-start"
                                            gap="xs"
                                        >
                                            <Box flex={1}>
                                                <Group gap="xs" mb={5}>
                                                    <Badge
                                                        size="xs"
                                                        variant="outline"
                                                        color="blue"
                                                    >
                                                        #{index + 1}
                                                    </Badge>
                                                    {bookmark.userNote && (
                                                        <Text
                                                            size="xs"
                                                            fw={500}
                                                            lineClamp={1}
                                                        >
                                                            {bookmark.userNote}
                                                        </Text>
                                                    )}
                                                </Group>

                                                <Text
                                                    size="xs"
                                                    c="dimmed"
                                                    lineClamp={2}
                                                    className={
                                                        styles.contextText
                                                    }
                                                >
                                                    ...{bookmark.contextText}...
                                                </Text>

                                                <Text
                                                    size="xs"
                                                    c="dimmed"
                                                    mt={4}
                                                >
                                                    {formatTimestamp(
                                                        bookmark.timestamp
                                                    )}
                                                </Text>
                                            </Box>

                                            <Group gap={2}>
                                                <Tooltip label="Go to bookmark">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="blue"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onBookmarkClick(
                                                                bookmark
                                                            );
                                                        }}
                                                    >
                                                        <IconExternalLink
                                                            size={12}
                                                        />
                                                    </ActionIcon>
                                                </Tooltip>

                                                <Tooltip label="Remove bookmark">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        color="red"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onBookmarkRemove(
                                                                bookmark.id
                                                            );
                                                        }}
                                                    >
                                                        <IconX size={12} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Group>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
                        </ScrollArea>
                    </Paper>
                </Collapse>
            </Affix>
        </Box>
    );
}
