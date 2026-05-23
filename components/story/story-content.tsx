"use client";
import { UpdateStoryContent } from "@/components/forms/story/update-story-form-context";
import { useBookmark } from "@/lib/hooks/bookmark/use-bookmark";
import { useContextMenuBookmark } from "@/lib/hooks/bookmark/use-context-menu-bookmark";
import {
    forceRenderBookmarkIndicators,
    shouldReRenderBookmarks,
} from "@/lib/utils/bookmark/bookmark-renderer";
import { sanitizeHTML } from "@/lib/utils/sanitize-html";
import {
    estimateReadingTime,
    formatEstimatedReadingTime,
} from "@/lib/utils/story/story-utils";
import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story/story-page.module.css";
import { StoryContentType } from "@/types/story";
import { Badge, Box, Group, ScrollArea, Stack } from "@mantine/core";
import {
    useDisclosure,
    useElementSize,
    useFullscreen,
    useMergedRef,
} from "@mantine/hooks";
import { IconClock } from "@tabler/icons-react";
import cx from "clsx";
import { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { BookmarkContextMenu } from "../bookmark/bookmark-context-menu";
import { BookmarkList } from "../bookmark/bookmark-list";
import { BookmarkModal } from "../bookmark/bookmark-modal";
import { StoryContentButtons } from "./buttons/story-content-btns";
import { StoryTableOfContents } from "./story-table-of-contents";

export type StoryContentProps = StoryContentType & {
    storyContentNode?: ReactNode;
    serverSanitizedHTML?: string;
};

export function StoryContent({
    toggleContentField,
    openedContentField,
    content,
    form,
    storyISBN,
    permissions,
    storyContentNode,
    serverSanitizedHTML,
}: StoryContentProps) {
    const {
        showContextMenu,
        menuPosition,
        contextMenuRef,
        hideContextMenu,
        getBookmarkData,
    } = useContextMenuBookmark();

    const {
        renderBookmarks,
        scrollToBookmark,
        bookmarks,
        addBookmark,
        removeBookmark,
        handleFailedBookmarks,
    } = useBookmark({
        postId: storyISBN,
        openedContentField,
    });

    const [modalOpened, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    const [pendingBookmarkData, setPendingBookmarkData] = useState<{
        containerSelector: string;
        position: number;
        contextText: string;
    } | null>(null);

    const handleAddBookmark = useCallback(() => {
        const bookmarkData = getBookmarkData();
        if (!bookmarkData) return;

        setPendingBookmarkData(bookmarkData);
        openModal();
        hideContextMenu();
    }, [getBookmarkData, openModal, hideContextMenu]);

    const handleSaveBookmark = useCallback(
        (note: string) => {
            if (!pendingBookmarkData) return;

            addBookmark({
                containerSelector: pendingBookmarkData.containerSelector,
                position: pendingBookmarkData.position,
                contextText: pendingBookmarkData.contextText,
                userNote: note || undefined,
            });

            setPendingBookmarkData(null);
        },
        [pendingBookmarkData, addBookmark],
    );

    const handleBookmarkRemove = useCallback(
        (id: string) => {
            removeBookmark(id);

            const remainingBookmarks = bookmarks.filter((b) => b.id !== id);

            // Use requestAnimationFrame for smoother DOM updates
            requestAnimationFrame(() => {
                setTimeout(() => {
                    forceRenderBookmarkIndicators(
                        remainingBookmarks,
                        handleFailedBookmarks,
                    );
                }, 50);
            });
        },
        [bookmarks, removeBookmark, handleFailedBookmarks],
    );

    const handleContextMenuClose = useCallback(() => {
        hideContextMenu();

        if (
            !openedContentField &&
            bookmarks.length > 0 &&
            shouldReRenderBookmarks(bookmarks)
        ) {
            requestAnimationFrame(() => {
                setTimeout(() => renderBookmarks(true), 100);
            });
        }
    }, [hideContextMenu, bookmarks, renderBookmarks, openedContentField]);

    // Track the initial payload content to fallback to client-rendering if edited optimistically
    const initialContentRef = useRef(content);
    const isContentUpdated = content !== initialContentRef.current;

    const timeToRead = useMemo(
        () => formatEstimatedReadingTime(estimateReadingTime(content)),
        [content],
    );

    const sanitizedContent = useMemo(() => {
        if (!isContentUpdated && serverSanitizedHTML !== undefined) {
            return serverSanitizedHTML;
        }
        return sanitizeHTML(content);
    }, [content, isContentUpdated, serverSanitizedHTML]);

    const {
        ref: fullscreenRef,
        toggle: toggleFullscreen,
        fullscreen,
    } = useFullscreen();

    const { ref: scrollAreaSizeRef, width, height } = useElementSize();
    const scrollAreaTocRef = useRef<HTMLDivElement>(null);
    const scrollAreaMergeRef = useMergedRef(
        scrollAreaSizeRef,
        scrollAreaTocRef,
    );

    const shouldShowEditContent = useMemo(
        () => openedContentField && permissions?.canUpdate,
        [openedContentField, permissions],
    );

    return (
        <Stack className={publicStyles.relative} gap="xs">
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
                        mr="auto"
                    >
                        {timeToRead}
                    </Badge>

                    <StoryTableOfContents
                        scrollAreaTocRef={scrollAreaTocRef}
                        content={sanitizedContent}
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

            <Box
                flex={1}
                ref={fullscreenRef}
                className={cx(publicStyles.relative)}
            >
                <Stack
                    gap="xs"
                    justify="space-around"
                    className={cx(storypageStyles.storyContentBtns)}
                >
                    <StoryContentButtons
                        form={form}
                        permissions={permissions}
                        openedContentField={openedContentField}
                        toggleContentField={toggleContentField}
                        toggleFullscreen={toggleFullscreen}
                        fullscreen={fullscreen}
                    />
                    {fullscreen && !openedContentField && (
                        <Stack gap="xl">
                            <StoryTableOfContents
                                scrollAreaTocRef={scrollAreaTocRef}
                                content={sanitizedContent}
                                height={height}
                                width={width}
                            />
                            <BookmarkList
                                bookmarks={bookmarks}
                                onBookmarkClick={scrollToBookmark}
                                onBookmarkRemove={handleBookmarkRemove}
                            />
                        </Stack>
                    )}
                </Stack>

                <ScrollArea
                    ref={scrollAreaMergeRef}
                    className={cx(storypageStyles.storyContentScrollArea)}
                    offsetScrollbars={!fullscreen ? "present" : false}
                    style={{
                        ...(fullscreen
                            ? { height: "100%" }
                            : { height: "100dvh" }),
                    }}
                >
                    {isContentUpdated || !storyContentNode ? (
                        <Box
                            dangerouslySetInnerHTML={{
                                __html: sanitizedContent,
                            }}
                            className={cx(
                                storypageStyles.storyContent,
                                openedContentField && publicStyles.hide,
                            )}
                            data-story-content="true"
                            style={{
                                userSelect: "text",
                                WebkitUserSelect: "text",
                                MozUserSelect: "text",
                                msUserSelect: "text",
                            }}
                        />
                    ) : (
                        <Box
                            className={cx(
                                openedContentField && publicStyles.hide,
                            )}
                        >
                            {storyContentNode}
                        </Box>
                    )}
                    <UpdateStoryContent
                        className={cx(
                            storypageStyles.storyContent,
                            !shouldShowEditContent && publicStyles.hide,
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
