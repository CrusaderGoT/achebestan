// components/BookmarkList.tsx
import styles from "@/styles/bookmark/bookmark-list.module.css";
import { Bookmark } from "@/types/bookmark";
import {
    ActionIcon,
    Affix,
    Badge,
    Box,
    CloseButton,
    Group,
    Paper,
    ScrollArea,
    Stack,
    Text,
    Tooltip,
    Transition,
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

    return (
        <>
            <ActionIcon variant="subtle" size="sm" onClick={toggle}>
                <IconBookmarks size={16} />
            </ActionIcon>

            <Affix position={{ top: 70, right: 30 }} withinPortal={false}>
                <Transition
                    mounted={opened}
                    duration={400}
                    transition={"fade-down"}
                    timingFunction="linear"
                >
                    {(transitionStyles) => (
                        <Paper
                            ref={ref}
                            withBorder
                            className={styles.bookmarkList}
                            style={transitionStyles}
                        >
                            <Group justify="space-between" mb="sm">
                                <Group gap="xs">
                                    <Text fw={600} size="sm">
                                        Bookmarks
                                    </Text>
                                    <Badge
                                        size="xs"
                                        variant="light"
                                        color="blue"
                                    >
                                        {bookmarks.length}
                                    </Badge>
                                </Group>

                                <CloseButton
                                    variant="subtle"
                                    size="sm"
                                    onClick={close}
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
                                            onClick={() => {
                                                onBookmarkClick(bookmark);
                                                close();
                                            }}
                                        >
                                            <Group
                                                justify="space-between"
                                                align="flex-start"
                                                gap="xs"
                                            >
                                                <Stack flex={1} gap={2}>
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
                                                                {
                                                                    bookmark.userNote
                                                                }
                                                            </Text>
                                                        )}
                                                    </Group>

                                                    <Box
                                                        className={
                                                            styles.contextText
                                                        }
                                                    >
                                                        <Text
                                                            size="xs"
                                                            c="dimmed"
                                                            lineClamp={2}
                                                        >
                                                            {
                                                                bookmark.contextText
                                                            }
                                                        </Text>
                                                    </Box>

                                                    <Text
                                                        size="xs"
                                                        c="dimmed"
                                                        mt={4}
                                                    >
                                                        {dayjs(
                                                            bookmark.timestamp,
                                                        ).fromNow()}
                                                    </Text>
                                                </Stack>

                                                <Group gap={2}>
                                                    <Tooltip label="Go to bookmark">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="blue"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onBookmarkClick(
                                                                    bookmark,
                                                                );
                                                                close();
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
                                                                    bookmark.id,
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
                    )}
                </Transition>
            </Affix>
        </>
    );
}
