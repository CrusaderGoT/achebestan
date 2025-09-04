// components/ui/BookmarkContextMenu.tsx
import contextMenuStyles from "@/styles/bookmark/bookmark-context-menu.module.css";
import { ActionIcon, Group, Paper, Portal, Text } from "@mantine/core";
import { IconBookmarkPlus, IconX } from "@tabler/icons-react";

interface BookmarkContextMenuProps {
    visible: boolean;
    position: { x: number; y: number } | null;
    onAddBookmark: () => void;
    onClose: () => void;
    contextText: string;
    menuRef: React.RefObject<HTMLDivElement | null>;
}

export function BookmarkContextMenu({
    visible,
    position,
    onAddBookmark,
    onClose,
    contextText,
    menuRef,
}: BookmarkContextMenuProps) {
    if (!visible || !position) return null;

    const handleAddBookmark = () => {
        onAddBookmark();
        onClose();
    };

    return (
        <Portal>
            <Paper
                ref={menuRef}
                className={contextMenuStyles.contextMenu}
                style={{
                    left: position.x,
                    top: position.y,
                }}
                p="xs"
                shadow="lg"
                radius="md"
                withBorder
            >
                <Group gap="xs" mb="xs">
                    <Text size="xs" fw={600} c="dimmed">
                        Bookmark Menu
                    </Text>
                    <ActionIcon
                        variant="subtle"
                        size="xs"
                        color="gray"
                        onClick={onClose}
                        ml="auto"
                    >
                        <IconX size={12} />
                    </ActionIcon>
                </Group>

                <Text
                    size="xs"
                    c="dimmed"
                    mb="sm"
                    className={contextMenuStyles.contextPreview}
                >
                    {contextText.length > 50
                        ? contextText.substring(0, 50) + "..."
                        : contextText}
                </Text>

                <Group gap="xs">
                    <ActionIcon
                        variant="light"
                        color="blue"
                        size="sm"
                        onClick={handleAddBookmark}
                        className={contextMenuStyles.menuButton}
                    >
                        <IconBookmarkPlus size={14} />
                    </ActionIcon>
                    <Text
                        size="sm"
                        className={contextMenuStyles.menuText}
                        onClick={handleAddBookmark}
                    >
                        Add Bookmark
                    </Text>
                </Group>
            </Paper>
        </Portal>
    );
}
