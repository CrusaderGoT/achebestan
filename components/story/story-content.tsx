"use client";

import { UpdateStoryContent } from "@/components/forms/story/update-story-form-context";
import { StoryContentType } from "@/types/story";
import { Badge, Box, Group, ScrollArea, Stack } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";

import { useBookmarkRenderer } from "@/lib/hooks/bookmark/use-bookmark-renderer";
import { useContextMenuBookmark } from "@/lib/hooks/bookmark/use-context-menu-bookmark";
import {
    forceRenderBookmarkIndicators,
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
import { useCallback, useRef, useState } from "react";
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

    form.watch("content", ({ dirty }) => {
        setDirty(dirty);
    });

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
    } = useBookmarkRenderer({
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
