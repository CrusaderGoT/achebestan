"use client";

import { BookStoriesType } from "@/types/books";
import { Pagination } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export function BookPagination({
    chapters,
    part,
}: {
    chapters: BookStoriesType;
    part: number;
}) {
    const router = useRouter();

    // Ensure active page follows the incoming prop
    const [activePage, setActivePage] = useState(() => Math.max(1, part ?? 1));
    useEffect(() => {
        if (typeof part === "number" && part !== activePage) {
            setActivePage(Math.max(1, part));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [part]);

    const total = useMemo(() => Math.max(1, chapters.length), [chapters]);

    const handleNextBookPage = useCallback(
        async (page: number) => {
            setActivePage(page);

            // prefer finding by bookPart, fallback to index-based lookup
            const chapter =
                chapters.find((c) => c.bookPart === page) ?? chapters[page - 1];

            if (!chapter?.isbn) {
                // nothing to navigate to
                return;
            }

            router.push(`/story/${chapter.isbn}`);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [chapters]
    );

    return (
        <Pagination
            value={activePage}
            onChange={handleNextBookPage}
            total={total}
            aria-label="Book pagination"
        />
    );
}
