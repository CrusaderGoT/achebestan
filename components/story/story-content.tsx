"use client";

import { UpdateStoryContent } from "@/components/forms/story/update-story-form-context";
import { StoryUpdateType } from "@/zod-schemas/story";
import { Badge, Box, Group, ScrollArea, Stack } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import { IconClock } from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { useBookmarks } from "@/lib/hooks/bookmark/use-bookmarks";
import { useContextMenuBookmark } from "@/lib/hooks/bookmark/use-context-menu-bookmark";
import {
    forceRenderBookmarkIndicators,
    renderBookmarkIndicators,
    shouldReRenderBookmarks,
} from "@/lib/utils/bookmark-renderer";
import {
    estimateReadingTime,
    formatEstimatedReadingTime,
} from "@/lib/utils/helpers";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import { useDisclosure, useFullscreen } from "@mantine/hooks";
import cx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookmarkContextMenu } from "../bookmark/bookmark-context-menu";
import { BookmarkList } from "../bookmark/bookmark-list";
import { BookmarkModal } from "../bookmark/bookmark-modal";
import { StoryContentButtons } from "./buttons/story-content-btns";
import { StoryTableOfContents } from "./story-table-of-contents";

type StoryContentType = {
    toggleContentField: () => void;
    openedContentField: boolean;
    content: string;
    form: UseFormReturnType<StoryUpdateType>;
    session: ReturnType<typeof authClient.useSession>;
    storyAuthorId: string;
    storyISBN: string;
};

export function StoryContent({
    toggleContentField,
    openedContentField,
    content,
    form,
    session,
    storyAuthorId,
    storyISBN,
}: StoryContentType) {
    const [dirty, setDirty] = useState(false);
    const renderAttempts = useRef(0);
    const maxRenderAttempts = 3;

    form.watch("content", ({ dirty }) => {
        setDirty(dirty);
    });

    const { bookmarks, addBookmark, removeBookmark, scrollToBookmark } =
        useBookmarks(storyISBN);

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
        // Force immediate re-render after removal
        const remainingBookmarks = bookmarks.filter((b) => b.id !== id);
        setTimeout(() => {
            forceRenderBookmarkIndicators(remainingBookmarks);
        }, 50);
    };

    // Robust bookmark rendering with retry logic
    const renderBookmarks = useCallback(
        (force = false) => {
            if (bookmarks.length === 0) {
                // Clear any existing indicators if no bookmarks
                document
                    .querySelectorAll("[data-bookmark-id]")
                    .forEach((el) => el.remove());
                return;
            }

            if (force) {
                renderAttempts.current = 0;
                forceRenderBookmarkIndicators(bookmarks);
            } else {
                renderBookmarkIndicators(bookmarks);
            }
        },
        [bookmarks]
    );

    const handleContextMenuClose = useCallback(() => {
        hideContextMenu();
        // Small delay to ensure DOM is stable before re-rendering
        setTimeout(() => {
            if (bookmarks.length > 0 && shouldReRenderBookmarks(bookmarks)) {
                renderBookmarks(true);
            }
        }, 100);
    }, [hideContextMenu, bookmarks, renderBookmarks]);

    const timeToRead = formatEstimatedReadingTime(estimateReadingTime(content));

    // Main effect for rendering bookmarks
    useEffect(() => {
        const timer = setTimeout(() => {
            renderBookmarks();
        }, 100);

        return () => clearTimeout(timer);
    }, [bookmarks, renderBookmarks]);

    // Additional effect to check and re-render if needed (fallback)
    useEffect(() => {
        const checkTimer = setTimeout(() => {
            if (
                shouldReRenderBookmarks(bookmarks) &&
                renderAttempts.current < maxRenderAttempts
            ) {
                console.log("Re-rendering bookmarks (fallback check)");
                renderAttempts.current++;
                renderBookmarks(true);
            }
        }, 500);

        return () => clearTimeout(checkTimer);
    });

    // Re-render bookmarks when context menu is hidden
    useEffect(() => {
        if (!showContextMenu && bookmarks.length > 0) {
            const timer = setTimeout(() => {
                if (shouldReRenderBookmarks(bookmarks)) {
                    console.log(
                        "Re-rendering bookmarks after context menu closed"
                    );
                    renderBookmarks(true);
                }
            }, 200);

            return () => clearTimeout(timer);
        }
    }, [showContextMenu, bookmarks, renderBookmarks]);

    // Force re-render on window focus (in case of any issues)
    useEffect(() => {
        const handleFocus = () => {
            if (document.hasFocus() && bookmarks.length > 0) {
                setTimeout(() => {
                    if (shouldReRenderBookmarks(bookmarks)) {
                        console.log("Re-rendering bookmarks on window focus");
                        renderBookmarks(true);
                    }
                }, 300);
            }
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [bookmarks, renderBookmarks]);

    // for content full screen functionality
    const { ref, toggle: toggleFullscreen, fullscreen } = useFullscreen();

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    return (
        <Stack className={publicStyles.relative} gap={"xs"}>
            {/* Context Menu for Bookmarks */}
            <BookmarkContextMenu
                visible={showContextMenu}
                position={menuPosition}
                onAddBookmark={handleAddBookmark}
                onClose={handleContextMenuClose}
                contextText={
                    pendingBookmarkData?.contextText ||
                    getBookmarkData()?.contextText ||
                    ""
                }
                menuRef={contextMenuRef}
            />

            {!openedContentField && (
                <Group justify="space-between">
                    <Badge
                        size="xs"
                        variant="subtle"
                        leftSection={<IconClock size={14} />}
                    >
                        {timeToRead}
                    </Badge>

                    {/* Bookmark List Sidebar */}
                    <BookmarkList
                        bookmarks={bookmarks}
                        onBookmarkClick={scrollToBookmark}
                        onBookmarkRemove={handleBookmarkRemove}
                    />
                </Group>
            )}

            {/* Pass the scrollAreaRef to the TableOfContents */}
            <StoryTableOfContents
                dependency={sanitizeHTML(content)}
                scrollAreaRef={scrollAreaRef}
            />

            <Box flex={1} ref={ref} className={cx(publicStyles.relative)}>
                <StoryContentButtons
                    storyAuthorId={storyAuthorId}
                    sessionUserId={session.data?.user.id}
                    isFormSubmiting={form.submitting}
                    openedContentField={openedContentField}
                    dirty={dirty}
                    toggleContentField={toggleContentField}
                    toggleFullscreen={toggleFullscreen}
                    fullscreen={fullscreen}
                />

                {/**Do not use ScrollAreaAutosize; it causes both content and content field to appear at the same time*/}
                <ScrollArea
                    ref={scrollAreaRef}
                    className={cx(storypageStyles.storyContentScrollArea)}
                    offsetScrollbars={!fullscreen ? "present" : false}
                    style={{
                        ...(fullscreen ? { height: "100%" } : {}),
                    }}
                >
                    <Box
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHTML(content),
                        }}
                        className={cx(
                            storypageStyles.storyContent,
                            openedContentField && publicStyles.hide
                        )}
                        data-story-content="true"
                        style={{
                            userSelect: "text",
                            WebkitUserSelect: "text",
                            MozUserSelect: "text",
                            msUserSelect: "text",
                        }}
                    />

                    <UpdateStoryContent
                        className={cx(
                            storypageStyles.storyContent,
                            (!openedContentField ||
                                storyAuthorId !== session.data?.user.id) &&
                                publicStyles.hide
                        )}
                    />
                </ScrollArea>
            </Box>

            {/* Bookmark Modal */}
            <BookmarkModal
                opened={modalOpened}
                onClose={closeModal}
                onSave={handleSaveBookmark}
                contextText={pendingBookmarkData?.contextText || ""}
            />
        </Stack>
    );
}
