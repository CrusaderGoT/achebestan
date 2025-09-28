// hooks/useBookmarks.ts
import {
    forceRenderBookmarkIndicators,
    getContextAtPosition,
    shouldUpdateBookmarkContext,
} from "@/lib/utils/bookmark-renderer";
import styles from "@/styles/bookmark/bookmark-indicator.module.css";
import { randomId, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useCallback, useRef } from "react";
import { Bookmark } from "../../../types/bookmark";

export function useBookmarks(postId?: string) {
    const storageKey = postId ? `bookmarks-${postId}` : "bookmarks";
    const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>({
        key: storageKey,
        defaultValue: [],
    });

    const addBookmark = useCallback(
        (bookmark: Omit<Bookmark, "id" | "timestamp">) => {
            const newBookmark: Bookmark = {
                ...bookmark,
                id: crypto.randomUUID(),
                timestamp: Date.now(),
            };
            setBookmarks((prev) => [...prev, newBookmark]);
            return newBookmark;
        },
        [setBookmarks]
    );

    const updateBookmark = useCallback(
        (updatedBookmark: Bookmark) => {
            setBookmarks((prevBookmarks) => {
                const existingIndex = prevBookmarks.findIndex(
                    (b) => b.id === updatedBookmark.id
                );

                if (existingIndex === -1) {
                    // Bookmark doesn't exist, add it
                    return [...prevBookmarks, updatedBookmark];
                }

                // Update existing bookmark while preserving array order
                const newBookmarks = [...prevBookmarks];
                newBookmarks[existingIndex] = updatedBookmark;
                return newBookmarks;
            });
        },
        [setBookmarks]
    );

    const removeBookmark = useCallback(
        (id: string) => {
            setBookmarks((prev) => prev.filter((b) => b.id !== id));
        },
        [setBookmarks]
    );

    const removeBulkBookmarks = useCallback(
        (ids: string[]) => {
            setBookmarks((prev) => prev.filter((b) => !ids.includes(b.id)));
        },
        [setBookmarks]
    );

    // Add state to track notified failed bookmarks
    const notifiedFailedBookmarks = useRef<Set<string>>(new Set());

    // Modified handleFailedBookmarks with deduplication
    const handleFailedBookmarks = useCallback(
        (failedBookmarks: Bookmark[]) => {
            if (failedBookmarks.length === 0) return;

            // Filter out bookmarks we've already notified about
            const newFailedBookmarks = failedBookmarks.filter(
                (bookmark) => !notifiedFailedBookmarks.current.has(bookmark.id)
            );

            if (newFailedBookmarks.length === 0) return;

            // Track these bookmarks as notified
            newFailedBookmarks.forEach((bookmark) => {
                notifiedFailedBookmarks.current.add(bookmark.id);
            });

            const failedIds = newFailedBookmarks.map((b) => b.id);
            removeBulkBookmarks(failedIds);

            const message =
                newFailedBookmarks.length === 1
                    ? `1 bookmark was removed because the content has changed.`
                    : `${newFailedBookmarks.length} bookmarks were removed because the content has changed.`;

            notifications.show({
                id: randomId(),
                title: "Bookmarks Removed",
                message,
                color: "yellow",
                autoClose: 5000,
                withCloseButton: true,
            });
        },
        [removeBulkBookmarks]
    );

    // Extracted context updating logic
    const tryUpdateBookmarkContext = useCallback(
        (bookmark: Bookmark) => {
            try {
                const container = document.querySelector(
                    bookmark.containerSelector
                );
                if (!container) return;

                const currentContext = getContextAtPosition(
                    container,
                    bookmark.position
                );

                if (
                    shouldUpdateBookmarkContext(
                        currentContext,
                        bookmark.contextText
                    )
                ) {
                    const updatedBookmark = {
                        ...bookmark,
                        contextText: currentContext,
                    };

                    updateBookmark(updatedBookmark);

                    notifications.show({
                        id: `context-update-${bookmark.id}`, // Prevent duplicate notifications
                        title: "Bookmark Context Updated",
                        message:
                            "Bookmark context was updated due to content changes.",
                        color: "blue",
                        autoClose: 3000,
                        withCloseButton: true,
                    });
                }
            } catch (error) {
                console.error("Error updating bookmark context:", error);
            }
        },
        [updateBookmark]
    );

    const scrollToBookmark = useCallback(
        (bookmark: Bookmark) => {
            const indicator = document.querySelector(
                `[data-bookmark-id="${bookmark.id}"]`
            );

            if (indicator) {
                // Successfully found indicator - scroll and animate
                indicator.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });

                indicator.classList.add(`${styles.pulse}`);
                setTimeout(() => {
                    indicator.classList.remove(`${styles.pulse}`);
                }, 1500);

                // Try to update bookmark context if needed
                tryUpdateBookmarkContext(bookmark);
                return;
            }

            // Indicator not found - try to handle gracefully
            handleMissingIndicator(bookmark);
        },
        [handleMissingIndicator, tryUpdateBookmarkContext]
    );

    // Extracted missing indicator handling
    const handleMissingIndicator = useCallback(
        (bookmark: Bookmark) => {
            // Check if we're in edit mode before attempting recovery
            const storyContent = document.querySelector(
                '[data-story-content="true"]'
            );
            const isInEditMode =
                storyContent?.classList.contains("hide") || false;

            if (isInEditMode) {
                // Don't try to render in edit mode, just show a gentle message
                notifications.show({
                    title: "Bookmark Temporarily Hidden",
                    message:
                        "This bookmark will appear when you exit edit mode.",
                    color: "gray",
                    autoClose: 2000,
                });
                return;
            }

            // Try to re-render the specific bookmark
            try {
                const result = forceRenderBookmarkIndicators([bookmark]);

                if (result.successful.length > 0) {
                    // Successfully re-rendered, try scrolling again
                    setTimeout(() => scrollToBookmark(bookmark), 100);
                } else if (result.failed.length > 0) {
                    // Bookmark is truly invalid, remove it
                    removeBulkBookmarks([bookmark.id]);

                    notifications.show({
                        title: "Bookmark Not Found",
                        message:
                            "This bookmark could not be located and has been removed.",
                        color: "red",
                        autoClose: 4000,
                        withCloseButton: true,
                    });
                }
            } catch (error) {
                console.error(
                    "Error handling missing bookmark indicator:",
                    error
                );
                notifications.show({
                    title: "Bookmark Error",
                    message: "There was an error locating this bookmark.",
                    color: "red",
                    autoClose: 3000,
                });
            }
        },
        [removeBulkBookmarks, scrollToBookmark]
    );

    return {
        bookmarks,
        addBookmark,
        removeBookmark,
        scrollToBookmark,
        handleFailedBookmarks,
        updateBookmark,
        notifiedFailedBookmarks,
    };
}
