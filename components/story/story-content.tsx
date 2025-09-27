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
        // Force immediate re-render after removal
        const remainingBookmarks = bookmarks.filter((b) => b.id !== id);
        setTimeout(() => {
            forceRenderBookmarkIndicators(
                remainingBookmarks,
                handleFailedBookmarks
            );
        }, 50);
    };

    // Robust bookmark rendering with retry logic and cleanup
    const renderBookmarks = useCallback(
        async (force = false) => {
            // Don't render bookmarks when content field is open (editor mode)
            if (openedContentField) {
                console.log(
                    "Skipping bookmark rendering: content field is open"
                );
                return;
            }

            if (bookmarks.length === 0) {
                // Clear any existing indicators if no bookmarks
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

                // If some bookmarks failed and we haven't exceeded max attempts, retry
                if (
                    result.failed.length > 0 &&
                    renderAttempts.current < maxRenderAttempts
                ) {
                    renderAttempts.current++;
                    setTimeout(() => {
                        console.log(
                            `Retrying failed bookmarks (attempt ${renderAttempts.current})`
                        );
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
        // Small delay to ensure DOM is stable before re-rendering
        // Only re-render if content field is not open
        if (!openedContentField) {
            setTimeout(() => {
                if (
                    bookmarks.length > 0 &&
                    shouldReRenderBookmarks(bookmarks)
                ) {
                    renderBookmarks(true);
                }
            }, 100);
        }
    }, [hideContextMenu, bookmarks, renderBookmarks, openedContentField]);

    const timeToRead = formatEstimatedReadingTime(estimateReadingTime(content));

    // Main effect for rendering bookmarks
    useEffect(() => {
        // Don't render bookmarks when in edit mode
        if (openedContentField) {
            return;
        }

        const timer = setTimeout(() => {
            renderBookmarks();
        }, 100);

        return () => clearTimeout(timer);
    }, [bookmarks, renderBookmarks, openedContentField]);

    // Additional effect to check and re-render if needed (fallback)
    useEffect(() => {
        // Don't run fallback check when in edit mode
        if (openedContentField) {
            return;
        }

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
    }, [bookmarks, renderBookmarks, openedContentField]);

    // Re-render bookmarks when context menu is hidden
    useEffect(() => {
        if (!showContextMenu && bookmarks.length > 0 && !openedContentField) {
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
    }, [showContextMenu, bookmarks, renderBookmarks, openedContentField]);

    // Force re-render on window focus (in case of any issues)
    useEffect(() => {
        const handleFocus = () => {
            if (
                document.hasFocus() &&
                bookmarks.length > 0 &&
                !openedContentField
            ) {
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
    }, [bookmarks, renderBookmarks, openedContentField]);

    // Effect to handle transitions between read and edit modes
    useEffect(() => {
        if (!openedContentField && bookmarks.length > 0) {
            // When switching back to read mode, re-render bookmarks after a delay
            // to ensure DOM is fully rendered
            const timer = setTimeout(() => {
                console.log("Re-rendering bookmarks after exiting edit mode");
                renderBookmarks(true);
            }, 200);

            return () => clearTimeout(timer);
        } else if (openedContentField) {
            // When entering edit mode, clear existing bookmark indicators
            // to prevent confusion and DOM conflicts
            document
                .querySelectorAll("[data-bookmark-id]")
                .forEach((el) => el.remove());
        }
    }, [openedContentField, bookmarks.length, renderBookmarks]);

    const {
        ref: fullscreenRef,
        toggle: toggleFullscreen,
        fullscreen,
    } = useFullscreen();

    // for observing change in scroll area height or width
    const { ref: scrollAreaSizeRef, width, height } = useElementSize();

    // the Element Ref
    const scrollAreaTocRef = useRef<HTMLDivElement>(null);

    // merge them
    const scrollAreaMergeRef = useMergedRef(
        scrollAreaSizeRef,
        scrollAreaTocRef
    );

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

                    {/* Bookmark List Sidebar */}
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

                {/**Do not use ScrollAreaAutosize; it causes both content and content field to appear at the same time*/}
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
