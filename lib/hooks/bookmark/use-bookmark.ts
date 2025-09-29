// ==============================================================================
// hooks/useBookmark.ts - React hook with state management and effects
// ==============================================================================

import {
    forceRenderBookmarkIndicators,
    getContextAtPosition,
    renderBookmarkIndicators,
    RenderResult,
    shouldReRenderBookmarks,
    shouldUpdateBookmarkContext,
} from "@/lib/utils/bookmark-renderer";
import styles from "@/styles/bookmark/bookmark-indicator.module.css";
import { Bookmark } from "@/types/bookmark";
import { useCounter, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useRef } from "react";

interface UseBookmarkRendererProps {
    postId?: string;
    openedContentField: boolean;
}

export function useBookmark({
    postId,
    openedContentField,
}: UseBookmarkRendererProps) {
    const notifiedFailedBookmarks = useRef<Set<string>>(new Set());
    const lastEditCloseTime = useRef<number>(0);

    const isPostSubmission = () =>
        Date.now() - lastEditCloseTime.current < 2000;

    const maxRenderAttempts = 3;
    const [
        renderAttempts,
        { increment: incrementrenderAttempts, reset: resetrenderAttempts },
    ] = useCounter(0, {
        max: 3,
        min: 0,
    });

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

    // Enhanced updateBookmark with better state management
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

    const handleFailedBookmarks = useCallback(
        (failedBookmarks: Bookmark[]) => {
            if (failedBookmarks.length === 0) return;

            // Create a unique notification ID based on the failed bookmark IDs
            const failedIds = failedBookmarks
                .map((b) => b.id)
                .sort()
                .join("-");
            const notificationId = `bookmarks-removed-${failedIds}`;

            // Check if we've already shown this exact notification
            if (
                document.querySelector(
                    `[data-notification-id="${notificationId}"]`
                )
            ) {
                return;
            }

            // Filter out bookmarks we've already notified about
            const newFailedBookmarks = failedBookmarks.filter(
                (bookmark) => !notifiedFailedBookmarks.current.has(bookmark.id)
            );

            if (newFailedBookmarks.length < 1) return;

            // Track these bookmarks as notified
            newFailedBookmarks.forEach((bookmark) => {
                notifiedFailedBookmarks.current.add(bookmark.id);
            });

            const newFailedIds = newFailedBookmarks.map((b) => b.id);
            removeBulkBookmarks(newFailedIds);

            const message =
                newFailedBookmarks.length === 1
                    ? `1 bookmark was removed because the content has changed.`
                    : `${newFailedBookmarks.length} bookmarks were removed because the content has changed.`;

            notifications.show({
                id: notificationId,
                title: "Bookmarks Removed",
                message,
                color: "yellow",
                autoClose: 5000,
                withCloseButton: true,
            });
        },
        [removeBulkBookmarks]
    );

    const renderBookmarks = useCallback(
        async (force = false) => {
            // Don't render when in edit mode
            if (openedContentField) return;

            if (bookmarks.length < 1) {
                // Clear both indicators and notification tracking when no bookmarks
                document
                    .querySelectorAll("[data-bookmark-id]")
                    .forEach((el) => el.remove());
                notifiedFailedBookmarks.current.clear();
                return;
            }

            try {
                let result: RenderResult;
                if (force) {
                    resetrenderAttempts();
                    result = forceRenderBookmarkIndicators(bookmarks);
                } else {
                    result = await renderBookmarkIndicators(bookmarks);
                }

                // Handle failed bookmarks (this will deduplicate notifications)
                if (result.failed.length > 0) {
                    handleFailedBookmarks(result.failed);
                }

                // Retry failed bookmarks ONLY if we haven't reached max attempts
                // and ONLY if we haven't already notified about these bookmarks
                if (
                    result.failed.length > 0 &&
                    renderAttempts < maxRenderAttempts
                ) {
                    const unnotifiedFailed = result.failed.filter(
                        (bookmark) =>
                            !notifiedFailedBookmarks.current.has(bookmark.id)
                    );

                    if (unnotifiedFailed.length > 0) {
                        incrementrenderAttempts();
                        setTimeout(() => {
                            forceRenderBookmarkIndicators(unnotifiedFailed);
                        }, 1000);
                    }
                }
            } catch (error) {
                console.error("Error in renderBookmarks:", error);
            }
        },
        [
            bookmarks,
            openedContentField,
            resetrenderAttempts,
            incrementrenderAttempts,
            handleFailedBookmarks,
            renderAttempts,
        ]
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

            // Indicator not found - handle inline instead of separate function
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
                    // Successfully re-rendered, try scrolling again (but only once more)
                    setTimeout(() => {
                        const retryIndicator = document.querySelector(
                            `[data-bookmark-id="${bookmark.id}"]`
                        );
                        if (retryIndicator) {
                            retryIndicator.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            });
                            retryIndicator.classList.add(`${styles.pulse}`);
                            setTimeout(() => {
                                retryIndicator.classList.remove(
                                    `${styles.pulse}`
                                );
                            }, 1500);
                            tryUpdateBookmarkContext(bookmark);
                        }
                    }, 100);
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
        [tryUpdateBookmarkContext, removeBulkBookmarks]
    );

    // Main bookmark rendering effect with post-submission stability
    useEffect(() => {
        if (openedContentField) {
            // Clear indicators when entering edit mode
            document
                .querySelectorAll("[data-bookmark-id]")
                .forEach((el) => el.remove());
            return;
        }

        // Track when edit mode closes (potential form submission)
        if (!openedContentField) {
            lastEditCloseTime.current = Date.now();
        }

        // When not in edit mode, render bookmarks with intelligent checking
        const baseDelay = isPostSubmission() ? 300 : 150; // Longer delay after potential submission

        const timer = setTimeout(() => {
            if (
                shouldReRenderBookmarks(bookmarks) ||
                renderAttempts < maxRenderAttempts
            ) {
                renderBookmarks(true);
                incrementrenderAttempts();

                // If this is potentially post-submission, do a follow-up check
                if (isPostSubmission()) {
                    setTimeout(() => {
                        if (
                            shouldReRenderBookmarks(bookmarks) &&
                            renderAttempts < maxRenderAttempts
                        ) {
                            incrementrenderAttempts();
                            renderBookmarks(true);
                        }
                    }, 500); // Additional check after content settles
                }
            }
        }, baseDelay);

        return () => clearTimeout(timer);
    }, [
        bookmarks,
        renderBookmarks,
        openedContentField,
        renderAttempts,
        incrementrenderAttempts,
    ]);

    // Window focus re-render - only when necessary
    useEffect(() => {
        const handleFocus = () => {
            if (
                document.hasFocus() &&
                bookmarks.length > 0 &&
                !openedContentField &&
                shouldReRenderBookmarks(bookmarks) &&
                !isPostSubmission() // Avoid interfering with post-submission renders
            ) {
                setTimeout(() => renderBookmarks(true), 100);
            }
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [bookmarks, renderBookmarks, openedContentField]);

    // Additional effect to handle revalidation-induced re-renders
    useEffect(() => {
        if (openedContentField) return;

        // Listen for potential DOM changes that might affect bookmarks
        const observer = new MutationObserver((mutations) => {
            const hasContentChanges = mutations.some(
                (mutation) =>
                    mutation.type === "childList" ||
                    (mutation.type === "characterData" &&
                        mutation.target.parentElement?.getAttribute(
                            "data-story-content"
                        ) === "true")
            );

            if (hasContentChanges && isPostSubmission()) {
                // Debounce re-renders during post-submission period
                setTimeout(() => {
                    if (
                        shouldReRenderBookmarks(bookmarks) &&
                        renderAttempts < maxRenderAttempts
                    ) {
                        incrementrenderAttempts();
                        renderBookmarks(true);
                    }
                }, 200);
            }
        });

        // Only observe the story content area if it exists
        const storyContent = document.querySelector(
            '[data-story-content="true"]'
        );
        if (storyContent) {
            observer.observe(storyContent, {
                childList: true,
                subtree: true,
                characterData: true,
            });
        }

        return () => observer.disconnect();
    }, [
        bookmarks,
        renderBookmarks,
        openedContentField,
        renderAttempts,
        incrementrenderAttempts,
    ]);

    // Clean up notification tracking when bookmarks change significantly
    useEffect(() => {
        const currentBookmarkIds = new Set(bookmarks.map((b) => b.id));
        const notifiedIds = Array.from(notifiedFailedBookmarks.current);

        // Remove tracking for bookmarks that no longer exist in our bookmarks array
        notifiedIds.forEach((id) => {
            if (!currentBookmarkIds.has(id)) {
                notifiedFailedBookmarks.current.delete(id);
            }
        });
    }, [bookmarks]);

    return {
        renderBookmarks,
        scrollToBookmark,
        updateBookmark,
        addBookmark,
        removeBookmark,
        bookmarks,
        handleFailedBookmarks,
    };
}
