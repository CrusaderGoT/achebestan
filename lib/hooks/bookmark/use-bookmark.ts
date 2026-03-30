// ==============================================================================
// hooks/useBookmark.ts - Improved with race condition fixes and optimizations
// ==============================================================================
import {
    forceRenderBookmarkIndicators,
    getContextAtPosition,
    renderBookmarkIndicators,
    RenderResult,
    shouldReRenderBookmarks,
    shouldUpdateBookmarkContext,
} from "@/lib/utils/bookmark/bookmark-renderer";
import styles from "@/styles/bookmark/bookmark-indicator.module.css";
import { Bookmark } from "@/types/bookmark";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useRef } from "react";

interface UseBookmarkRendererProps {
    postId?: string;
    openedContentField: boolean;
}

const MAX_RENDER_ATTEMPTS = 3;
const POST_SUBMISSION_WINDOW = 2000;
const MAX_NOTIFIED_BOOKMARKS = 100; // Prevent unbounded growth

export function useBookmark({
    postId,
    openedContentField,
}: UseBookmarkRendererProps) {
    // Refs for tracking state without causing re-renders
    const notifiedFailedBookmarks = useRef<Set<string>>(new Set());
    const lastEditCloseTime = useRef<number>(0);
    const renderAttempts = useRef<number>(0);
    const isRenderingRef = useRef<boolean>(false);
    const cleanupFunctionsRef = useRef<Array<() => void>>([]);

    const storageKey = postId ? `bookmarks-${postId}` : "bookmarks";
    const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>({
        key: storageKey,
        defaultValue: [],
    });

    const isPostSubmission = useCallback(() => {
        return Date.now() - lastEditCloseTime.current < POST_SUBMISSION_WINDOW;
    }, []);

    // Centralized cleanup function
    const cleanup = useCallback(() => {
        cleanupFunctionsRef.current.forEach((fn) => fn());
        cleanupFunctionsRef.current = [];
    }, []);

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
            notifiedFailedBookmarks.current.delete(id);
        },
        [setBookmarks]
    );

    const removeBulkBookmarks = useCallback(
        (ids: string[]) => {
            setBookmarks((prev) => prev.filter((b) => !ids.includes(b.id)));
            ids.forEach((id) => notifiedFailedBookmarks.current.delete(id));
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
                    return [...prevBookmarks, updatedBookmark];
                }

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

            // Filter out bookmarks we've already notified about
            const newFailedBookmarks = failedBookmarks.filter(
                (bookmark) => !notifiedFailedBookmarks.current.has(bookmark.id)
            );

            if (newFailedBookmarks.length === 0) return;

            // Bound the size of notified set to prevent memory leak
            if (notifiedFailedBookmarks.current.size > MAX_NOTIFIED_BOOKMARKS) {
                const toRemove = Array.from(
                    notifiedFailedBookmarks.current
                ).slice(
                    0,
                    notifiedFailedBookmarks.current.size -
                        MAX_NOTIFIED_BOOKMARKS
                );
                toRemove.forEach((id) =>
                    notifiedFailedBookmarks.current.delete(id)
                );
            }

            // Track these bookmarks as notified
            newFailedBookmarks.forEach((bookmark) => {
                notifiedFailedBookmarks.current.add(bookmark.id);
            });

            const newFailedIds = newFailedBookmarks.map((b) => b.id);
            removeBulkBookmarks(newFailedIds);

            const failedIds = newFailedBookmarks
                .map((b) => b.id)
                .sort()
                .join("-");
            const notificationId = `bookmarks-removed-${failedIds}`;

            const message =
                newFailedBookmarks.length === 1
                    ? "1 bookmark was removed because the content has changed."
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
            // Prevent concurrent renders
            if (isRenderingRef.current) {
                return;
            }

            if (openedContentField) return;

            if (bookmarks.length === 0) {
                document
                    .querySelectorAll("[data-bookmark-id]")
                    .forEach((el) => el.remove());
                notifiedFailedBookmarks.current.clear();
                return;
            }

            try {
                isRenderingRef.current = true;
                let result: RenderResult;

                if (force) {
                    renderAttempts.current = 0;
                    result = forceRenderBookmarkIndicators(bookmarks);
                } else {
                    result = await renderBookmarkIndicators(bookmarks);
                }

                if (result.failed.length > 0) {
                    handleFailedBookmarks(result.failed);
                }

                // Retry logic with attempt limiting
                if (
                    result.failed.length > 0 &&
                    renderAttempts.current < MAX_RENDER_ATTEMPTS
                ) {
                    const unnotifiedFailed = result.failed.filter(
                        (bookmark) =>
                            !notifiedFailedBookmarks.current.has(bookmark.id)
                    );

                    if (unnotifiedFailed.length > 0) {
                        renderAttempts.current++;
                        const timeoutId = setTimeout(() => {
                            forceRenderBookmarkIndicators(unnotifiedFailed);
                        }, 1000);

                        cleanupFunctionsRef.current.push(() =>
                            clearTimeout(timeoutId)
                        );
                    }
                }
            } catch (error) {
                console.error("Error in renderBookmarks:", error);
            } finally {
                isRenderingRef.current = false;
            }
        },
        [bookmarks, openedContentField, handleFailedBookmarks]
    );

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
                        id: `context-update-${bookmark.id}`,
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
                indicator.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
                indicator.classList.add(styles.pulse);

                const timeoutId = setTimeout(() => {
                    indicator.classList.remove(styles.pulse);
                }, 1500);

                cleanupFunctionsRef.current.push(() => clearTimeout(timeoutId));
                tryUpdateBookmarkContext(bookmark);
                return;
            }

            // Check if in edit mode
            const storyContent = document.querySelector(
                '[data-story-content="true"]'
            );
            const isInEditMode =
                storyContent?.classList.contains("hide") || false;

            if (isInEditMode) {
                notifications.show({
                    title: "Bookmark Temporarily Hidden",
                    message:
                        "This bookmark will appear when you exit edit mode.",
                    color: "gray",
                    autoClose: 2000,
                });
                return;
            }

            // Attempt recovery
            try {
                const result = forceRenderBookmarkIndicators([bookmark]);

                if (result.successful.length > 0) {
                    const timeoutId = setTimeout(() => {
                        const retryIndicator = document.querySelector(
                            `[data-bookmark-id="${bookmark.id}"]`
                        );
                        if (retryIndicator) {
                            retryIndicator.scrollIntoView({
                                behavior: "smooth",
                                block: "center",
                            });
                            retryIndicator.classList.add(styles.pulse);

                            const pulseTimeoutId = setTimeout(() => {
                                retryIndicator.classList.remove(styles.pulse);
                            }, 1500);

                            cleanupFunctionsRef.current.push(() => {
                                clearTimeout(pulseTimeoutId);
                            });

                            tryUpdateBookmarkContext(bookmark);
                        }
                    }, 100);

                    cleanupFunctionsRef.current.push(() =>
                        clearTimeout(timeoutId)
                    );
                } else if (result.failed.length > 0) {
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

    // Main rendering effect
    useEffect(() => {
        if (openedContentField) {
            document
                .querySelectorAll("[data-bookmark-id]")
                .forEach((el) => el.remove());
            return;
        }

        lastEditCloseTime.current = Date.now();

        const baseDelay = isPostSubmission() ? 300 : 150;
        const timer = setTimeout(() => {
            if (
                shouldReRenderBookmarks(bookmarks) ||
                renderAttempts.current < MAX_RENDER_ATTEMPTS
            ) {
                renderBookmarks(true);
                renderAttempts.current++;

                if (isPostSubmission()) {
                    const followUpTimer = setTimeout(() => {
                        if (
                            shouldReRenderBookmarks(bookmarks) &&
                            renderAttempts.current < MAX_RENDER_ATTEMPTS
                        ) {
                            renderAttempts.current++;
                            renderBookmarks(true);
                        }
                    }, 500);

                    cleanupFunctionsRef.current.push(() =>
                        clearTimeout(followUpTimer)
                    );
                }
            }
        }, baseDelay);

        return () => {
            clearTimeout(timer);
            cleanup();
        };
    }, [
        bookmarks,
        renderBookmarks,
        openedContentField,
        isPostSubmission,
        cleanup,
    ]);

    // Window focus handler
    useEffect(() => {
        const handleFocus = () => {
            if (
                document.hasFocus() &&
                bookmarks.length > 0 &&
                !openedContentField &&
                shouldReRenderBookmarks(bookmarks) &&
                !isPostSubmission()
            ) {
                const timeoutId = setTimeout(() => renderBookmarks(true), 100);
                cleanupFunctionsRef.current.push(() => clearTimeout(timeoutId));
            }
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [bookmarks, renderBookmarks, openedContentField, isPostSubmission]);

    // Mutation observer for DOM changes
    useEffect(() => {
        if (openedContentField) return;

        let debounceTimer: NodeJS.Timeout;

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
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    if (
                        shouldReRenderBookmarks(bookmarks) &&
                        renderAttempts.current < MAX_RENDER_ATTEMPTS
                    ) {
                        renderAttempts.current++;
                        renderBookmarks(true);
                    }
                }, 200);
            }
        });

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

        return () => {
            observer.disconnect();
            clearTimeout(debounceTimer);
        };
    }, [bookmarks, renderBookmarks, openedContentField, isPostSubmission]);

    // Cleanup notification tracking
    useEffect(() => {
        const currentBookmarkIds = new Set(bookmarks.map((b) => b.id));
        const notifiedIds = Array.from(notifiedFailedBookmarks.current);

        notifiedIds.forEach((id) => {
            if (!currentBookmarkIds.has(id)) {
                notifiedFailedBookmarks.current.delete(id);
            }
        });
    }, [bookmarks]);

    // Global cleanup on unmount
    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

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
