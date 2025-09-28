"use client";

import { UpdateStoryContent } from "@/components/forms/story/update-story-form-context";
import { StoryContentType } from "@/types/story";
import { Badge, Box, Group, ScrollArea, Stack } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";

import { useBookmarks } from "@/lib/hooks/bookmark/use-bookmarks";
import { useContextMenuBookmark } from "@/lib/hooks/bookmark/use-context-menu-bookmark";
import {
    forceRenderBookmarkIndicators,
    renderBookmarkIndicators,
    RenderResult,
    shouldReRenderBookmarks,
} from "@/lib/utils/bookmark-renderer";
import {
    estimateReadingTime,
    formatEstimatedReadingTime,
} from "@/lib/utils/helpers";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import {
    useDisclosure,
    useElementSize,
    useFullscreen,
    useMergedRef,
} from "@mantine/hooks";
import cx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookmarkContextMenu } from "../bookmark/bookmark-context-menu";
import { BookmarkList } from "../bookmark/bookmark-list";
import { BookmarkModal } from "../bookmark/bookmark-modal";
import { StoryContentButtons } from "./buttons/story-content-btns";
import { StoryTableOfContents } from "./story-table-of-contents";

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

    const {
        bookmarks,
        addBookmark,
        removeBookmark,
        scrollToBookmark,
        handleFailedBookmarks,
    } = useBookmarks(storyISBN);

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
        const remainingBookmarks = bookmarks.filter((b) => b.id !== id);
        setTimeout(() => {
            forceRenderBookmarkIndicators(
                remainingBookmarks,
                handleFailedBookmarks
            );
        }, 50);
    };

    const renderBookmarks = useCallback(
        async (force = false) => {
            // Don't render when in edit mode
            if (openedContentField) return;

            if (bookmarks.length === 0) {
                document
                    .querySelectorAll("[data-bookmark-id]")
                    .forEach((el) => el.remove());
                return;
            }

            try {
                let result: RenderResult;
                if (force) {
                    renderAttempts.current = 0;
                    result = forceRenderBookmarkIndicators(
                        bookmarks,
                        handleFailedBookmarks
                    );
                } else {
                    result = await renderBookmarkIndicators(
                        bookmarks,
                        handleFailedBookmarks
                    );
                }

                // Retry failed bookmarks
                if (
                    result.failed.length > 0 &&
                    renderAttempts.current < maxRenderAttempts
                ) {
                    renderAttempts.current++;
                    setTimeout(() => {
                        forceRenderBookmarkIndicators(
                            result.failed,
                            handleFailedBookmarks
                        );
                    }, 1000);
                }
            } catch (error) {
                console.error("Error in renderBookmarks:", error);
            }
        },
        [bookmarks, handleFailedBookmarks, openedContentField]
    );

    const handleContextMenuClose = useCallback(() => {
        hideContextMenu();
        if (
            !openedContentField &&
            bookmarks.length > 0 &&
            shouldReRenderBookmarks(bookmarks)
        ) {
            setTimeout(() => renderBookmarks(true), 100);
        }
    }, [hideContextMenu, bookmarks, renderBookmarks, openedContentField]);

    const timeToRead = formatEstimatedReadingTime(estimateReadingTime(content));

    // Optimized bookmark rendering effects

    // Main bookmark rendering effect - handles most scenarios
    useEffect(() => {
        if (openedContentField) {
            // Clear indicators when entering edit mode
            document
                .querySelectorAll("[data-bookmark-id]")
                .forEach((el) => el.remove());
            return;
        }

        // When not in edit mode, render bookmarks with intelligent checking
        const timer = setTimeout(() => {
            if (
                shouldReRenderBookmarks(bookmarks) ||
                renderAttempts.current < maxRenderAttempts
            ) {
                renderBookmarks(true);
                renderAttempts.current++;
            }
        }, 150); // Single optimized delay

        return () => clearTimeout(timer);
    }, [bookmarks, renderBookmarks, openedContentField]);

    // Window focus re-render - only when necessary
    useEffect(() => {
        const handleFocus = () => {
            if (
                document.hasFocus() &&
                bookmarks.length > 0 &&
                !openedContentField &&
                shouldReRenderBookmarks(bookmarks)
            ) {
                setTimeout(() => renderBookmarks(true), 100);
            }
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [bookmarks, renderBookmarks, openedContentField]);

    const {
        ref: fullscreenRef,
        toggle: toggleFullscreen,
        fullscreen,
    } = useFullscreen();

    const { ref: scrollAreaSizeRef, width, height } = useElementSize();
    const scrollAreaTocRef = useRef<HTMLDivElement>(null);
    const scrollAreaMergeRef = useMergedRef(
        scrollAreaSizeRef,
        scrollAreaTocRef
    );

    return (
        <Stack className={publicStyles.relative} gap={"xs"}>
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
                    <StoryTableOfContents
                        scrollAreaTocRef={scrollAreaTocRef}
                        content={sanitizeHTML(content)}
                        height={height}
                        width={width}
                    />

                    <Badge
                        size="xs"
                        variant="subtle"
                        leftSection={<IconClock size={14} />}
                        mr="auto"
                    >
                        {timeToRead}
                    </Badge>

                    <BookmarkList
                        bookmarks={bookmarks}
                        onBookmarkClick={scrollToBookmark}
                        onBookmarkRemove={handleBookmarkRemove}
                    />
                </Group>
            )}

            <Box
                flex={1}
                ref={fullscreenRef}
                className={cx(publicStyles.relative)}
            >
                <Stack
                    gap={"xs"}
                    justify="space-around"
                    className={cx(storypageStyles.storyContentBtns)}
                >
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

                    {fullscreen && !openedContentField && (
                        <Group gap={"xl"}>
                            <StoryTableOfContents
                                scrollAreaTocRef={scrollAreaTocRef}
                                content={sanitizeHTML(content)}
                                height={height}
                                width={width}
                            />

                            <BookmarkList
                                bookmarks={bookmarks}
                                onBookmarkClick={scrollToBookmark}
                                onBookmarkRemove={handleBookmarkRemove}
                            />
                        </Group>
                    )}
                </Stack>

                <ScrollArea
                    ref={scrollAreaMergeRef}
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

            <BookmarkModal
                opened={modalOpened}
                onClose={closeModal}
                onSave={handleSaveBookmark}
                contextText={pendingBookmarkData?.contextText || ""}
            />
        </Stack>
    );
}
