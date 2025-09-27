// hooks/useBookmarks.ts
import styles from "@/styles/bookmark/bookmark-indicator.module.css";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useCallback } from "react";
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

    const handleFailedBookmarks = useCallback(
        (failedBookmarks: Bookmark[]) => {
            if (failedBookmarks.length === 0) return;

            const failedIds = failedBookmarks.map((b) => b.id);

            // Show notification to user
            const message =
                failedBookmarks.length === 1
                    ? `1 bookmark could not be displayed because the content has changed.`
                    : `${failedBookmarks.length} bookmarks could not be displayed because the content has changed.`;

            notifications.show({
                title: "Bookmarks Removed",
                message,
                color: "yellow",
                autoClose: 5000,
                withCloseButton: true,
            });

            // Remove the failed bookmarks from storage
            removeBulkBookmarks(failedIds);

            console.log(
                "Removed failed bookmarks:",
                failedBookmarks.map((b) => ({
                    id: b.id,
                    contextText: b.contextText,
                    userNote: b.userNote,
                }))
            );
        },
        [removeBulkBookmarks]
    );

    const scrollToBookmark = useCallback((bookmark: Bookmark) => {
        const indicator = document.querySelector(
            `[data-bookmark-id="${bookmark.id}"]`
        );
        if (indicator) {
            indicator.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
            indicator.classList.add(`${styles.pulse}`);
            setTimeout(() => {
                indicator.classList.remove(`${styles.pulse}`);
            }, 1500);
        } else {
            // Check if we're in edit mode before showing error
            const isInEditMode =
                document
                    .querySelector('[data-story-content="true"]')
                    ?.classList.contains("hide") || false;

            if (!isInEditMode) {
                // Only show error if not in edit mode
                notifications.show({
                    title: "Bookmark Not Found",
                    message:
                        "This bookmark location could not be found. The content may have changed.",
                    color: "red",
                    autoClose: 4000,
                });
            }
        }
    }, []);

    return {
        bookmarks,
        addBookmark,
        removeBookmark,
        removeBulkBookmarks,
        scrollToBookmark,
        handleFailedBookmarks,
    };
}
