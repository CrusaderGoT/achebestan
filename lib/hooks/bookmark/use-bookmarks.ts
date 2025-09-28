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

    return {
        bookmarks,
        addBookmark,
        removeBookmark,
        updateBookmark,
        notifiedFailedBookmarks,
        setBookmarks,
        removeBulkBookmarks,
    };
}
