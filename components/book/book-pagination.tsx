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
    const queryClient = useQueryClient();

    const router = useRouter();

    const [activePage, setActivePage] = useState(storyPart);
    const [isPending, startTransition] = useTransition();

    const { data: chapters = [], isPlaceholderData } = useBookStories({
        bookId,
    });

    useEffect(() => {
        if (
            typeof storyPart === "number" &&
            storyPart !== activePage &&
            !isPending
        ) {
            setActivePage(storyPart);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storyPart, isPending]);

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

            setActivePage(page);

            startTransition(() => {
                router.replace(`/stories/${nextChapter.isbn}`, {
                    scroll: false,
                });
            });
        },
        [chapters, isPending, activePage, bookId],
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
