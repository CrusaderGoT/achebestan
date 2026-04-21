"use client";

import { readStory } from "@/lib/actions/story";
import { useBookStories } from "@/lib/hooks/book/book-stories";
import { Group, Loader, Pagination } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

export function BookPagination({
    storyPart,
    bookId,
}: {
    storyPart: number;
    bookId: number;
}) {
    const router = useRouter();
    const queryClient = useQueryClient();

    // Optimistic page — updates immediately on click, before navigation resolves
    const [activePage, setActivePage] = useState(storyPart);

    // isPending is true for the entire duration of the router.replace transition
    const [isPending, startTransition] = useTransition();

    const { data: chapters = [], isPlaceholderData } = useBookStories({
        bookId,
    });

    // Sync activePage from the prop only when we are NOT mid-navigation.
    // Without the isPending guard, storyPart arriving as the old value during a
    // transition would immediately clobber our optimistic update, making the
    // clicked page appear to "flash" back before settling.
    useEffect(() => {
        if (
            typeof storyPart === "number" &&
            storyPart !== activePage &&
            !isPending
        ) {
            setActivePage(storyPart);
        }
        // activePage intentionally omitted — we only want to react to external
        // prop changes, not our own optimistic writes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storyPart, isPending]);

    // Prefetch adjacent chapters so navigating feels instant
    useEffect(() => {
        if (isPlaceholderData || chapters.length === 0) return;

        const prefetchChapter = (pageToFetch: number) => {
            if (pageToFetch <= 0 || pageToFetch > chapters.length) return;

            const chapter =
                chapters.find((c) => c.bookPart === pageToFetch) ??
                chapters[pageToFetch - 1];

            if (chapter?.isbn) {
                queryClient.prefetchQuery({
                    queryKey: ["read-story", { isbn: chapter.isbn }],
                    queryFn: () => readStory(chapter.isbn),
                    staleTime: Infinity,
                    gcTime: 1000 * 60 * 60 * 24,
                });
            }
        };

        prefetchChapter(activePage + 1);
        prefetchChapter(activePage - 1);
    }, [chapters, isPlaceholderData, activePage, queryClient]);

    const handleNextBookPage = useCallback(
        (page: number) => {
            // Prevent double-navigation or clicking the already-active page
            if (isPending || page === activePage) return;

            const nextChapter =
                chapters.find((c) => c.bookPart === page) ?? chapters[page - 1];

            if (!nextChapter?.isbn) {
                notifications.show({
                    message: "That chapter appears missing...",
                    color: "red",
                });
                return;
            }

            // 1. Optimistic update — pagination reflects the new page instantly
            setActivePage(page);

            // 2. Wrap router.replace in a transition so React tracks the
            //    pending state for us. isPending stays true until the new
            //    route has fully rendered, giving us a free disabled + loader signal.
            startTransition(() => {
                router.replace(`/stories/${nextChapter.isbn}`, { scroll: false });
            });
        },
        [chapters, router, isPending, activePage],
    );

    if (chapters.length === 0) return null;

    return (
        <Group gap="xs" align="center" wrap="nowrap">
            <Pagination
                value={activePage}
                onChange={handleNextBookPage}
                total={chapters.length}
                aria-label="Book pagination"
                boundaries={1}
                siblings={1}
                color="yellow"
                hideWithOnePage
                withEdges
                disabled={isPending}
            />

            {/* Loader is only mounted while a navigation transition is in-flight */}
            {isPending && (
                <Loader
                    size="xs"
                    color="yellow"
                    aria-label="Navigating to chapter…"
                />
            )}
        </Group>
    );
}
