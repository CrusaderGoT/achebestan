"use client";

import { readStory } from "@/lib/actions/story";
import { useBookStories } from "@/lib/hooks/book/book-stories";
import { Pagination } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function BookPagination({
    storyPart,
    bookId,
}: {
    storyPart: number;
    bookId: number;
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activePage, setActivePage] = useState(storyPart);

    const { data: chapters = [], isPlaceholderData } = useBookStories({
        bookId,
    });

    // Effect for prefetching next/prev page
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

    useEffect(() => {
        if (typeof storyPart === "number" && storyPart !== activePage) {
            setActivePage(storyPart);
        }
    }, [storyPart, activePage]);

    const handleNextBookPage = useCallback(
        (page: number) => {
            setActivePage(page);

            const nextChapter =
                chapters.find((c) => c.bookPart === page) ?? chapters[page - 1];

            if (!nextChapter?.isbn) {
                notifications.show({
                    message: "That chapter appears missing...",
                    color: "red",
                });
                return;
            }

            router.replace(`/story/${nextChapter.isbn}`);
        },
        [chapters, router],
    );

    if (chapters.length === 0) return null;

    return (
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
        />
    );
}
