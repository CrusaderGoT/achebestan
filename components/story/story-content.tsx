"use client";

import { UpdateStoryContent } from "@/components/forms/story/update-story-form-context";
import { StoryUpdateType } from "@/zod-schemas/story";
import { ActionIcon, Box, Group, ScrollArea } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconCheck, IconEdit } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { useBookmarks } from "@/lib/hooks/use-bookmarks";
import { useContextMenuBookmark } from "@/lib/hooks/use-context-menu-bookmark";
import { renderBookmarkIndicators } from "@/lib/utils/bookmark-renderer";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import { useDisclosure } from "@mantine/hooks";
import cx from "clsx";
import { useEffect, useState } from "react";
import { BookmarkContextMenu } from "../ui/bookmark-context-menu";
import { BookmarkList } from "../ui/bookmark-list";
import { BookmarkModal } from "../ui/bookmark-modal";

type StoryContentType = {
    toggleContentField: () => void;
    openedContentField: boolean;
    content: string;
    form: UseFormReturnType<StoryUpdateType>;
    session: ReturnType<typeof authClient.useSession>;
    storyAuthorId: string;
};

export function StoryContent({
    toggleContentField,
    openedContentField,
    content,
    form,
    session,
    storyAuthorId,
}: StoryContentType) {
    const [dirty, setDirty] = useState(false);

    form.watch("content", ({ dirty }) => {
        setDirty(dirty);
    });

    const { bookmarks, addBookmark, removeBookmark, scrollToBookmark } =
        useBookmarks(storyAuthorId);

    const {
        showContextMenu,
        menuPosition,
        contextMenuRef,
        hideContextMenu,
        getBookmarkData,
    } = useContextMenuBookmark();

    const [modalOpened, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    const [pendingBookmarkData, setPendingBookmarkData] = useState<{
        containerSelector: string;
        position: number;
        contextText: string;
    } | null>(null);

    // Render bookmark indicators when bookmarks change
    useEffect(() => {
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            renderBookmarkIndicators(bookmarks);
        }, 100);

        return () => clearTimeout(timer);
    }, [bookmarks]);

    const handleAddBookmark = () => {
        const bookmarkData = getBookmarkData();
        if (!bookmarkData) return;

        setPendingBookmarkData(bookmarkData);
        openModal();
        hideContextMenu();
    };

    const handleSaveBookmark = (note: string) => {
        if (!pendingBookmarkData) return;

        addBookmark({
            containerSelector: pendingBookmarkData.containerSelector,
            position: pendingBookmarkData.position,
            contextText: pendingBookmarkData.contextText,
            userNote: note || undefined,
        });

        setPendingBookmarkData(null);
    };

    const handleBookmarkRemove = (id: string) => {
        removeBookmark(id);
        // Re-render indicators after removal
        const remainingBookmarks = bookmarks.filter((b) => b.id !== id);
        setTimeout(() => renderBookmarkIndicators(remainingBookmarks), 100);
    };

    return (
        <Box className={publicStyles.relative}>
            <Group
                justify="space-between"
                mb={"xs"}
                className={cx(
                    storyAuthorId !== session.data?.user.id && publicStyles.hide
                )}
            >
                <ActionIcon
                    loading={form.submitting}
                    title="Submit Update"
                    variant="light"
                    size={"xs"}
                    type="submit"
                    color="green"
                    className={cx(
                        (!openedContentField || !dirty) && publicStyles.hide
                    )}
                >
                    <IconCheck />
                </ActionIcon>

                <ActionIcon
                    onClick={() => {
                        toggleContentField();
                    }}
                    title="Update Story Content"
                    variant="subtle"
                    color="yellow"
                    size={"xs"}
                    ml={"auto"}
                    disabled={form.submitting}
                >
                    <IconEdit />
                </ActionIcon>
            </Group>

            {/* Context Menu for Bookmarks */}
            <BookmarkContextMenu
                visible={showContextMenu}
                position={menuPosition}
                onAddBookmark={handleAddBookmark}
                onClose={hideContextMenu}
                contextText={
                    pendingBookmarkData?.contextText ||
                    getBookmarkData()?.contextText ||
                    ""
                }
                menuRef={contextMenuRef}
            />

            {/* Bookmark List Sidebar */}
            <BookmarkList
                bookmarks={bookmarks}
                onBookmarkClick={scrollToBookmark}
                onBookmarkRemove={handleBookmarkRemove}
            />

            {/**Do not use ScrollAreaAutosize; it causes both content and content field to appear at the same time*/}
            <ScrollArea
                className={cx(
                    storypageStyles.storyContentScrollArea,
                    openedContentField && publicStyles.hide
                )}
                offsetScrollbars="present"
            >
                <Box
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHTML(content),
                    }}
                    className={cx(storypageStyles.storyContent)}
                    style={{
                        userSelect: "text",
                        WebkitUserSelect: "text",
                        MozUserSelect: "text",
                        msUserSelect: "text",
                    }}
                />
            </ScrollArea>

            <Box
                className={cx(
                    (!openedContentField ||
                        storyAuthorId !== session.data?.user.id) &&
                        publicStyles.hide
                )}
            >
                <UpdateStoryContent />
            </Box>

            {/* Bookmark Modal */}
            <BookmarkModal
                opened={modalOpened}
                onClose={closeModal}
                onSave={handleSaveBookmark}
                contextText={pendingBookmarkData?.contextText || ""}
            />
        </Box>
    );
}
