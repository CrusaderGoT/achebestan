"use client";

import { BookStoriesType } from "@/types/books";
import { Pagination } from "@mantine/core";
import { notifications } from "@mantine/notifications";
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

    const [activePage, setActivePage] = useState(part);

    useEffect(() => {
        if (typeof part === "number" && part !== activePage) {
            setActivePage(part);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [part]);

    const total = useMemo(() => chapters.length, [chapters]);

    const handleNextBookPage = useCallback(
        (page: number) => {
            setActivePage(page);

            // prefer finding by bookPart, fallback to index-based lookup
            const chapter =
                chapters.find((c) => c.bookPart === page) ?? chapters[page - 1];

            if (!chapter?.isbn) {
                notifications.show({
                    message: "That chapter appears missing...",
                    color: "red",
                });
                return;
            }

            router.replace(`/story/${chapter.isbn}`);
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
            boundaries={3}
            siblings={3}
            color="yellow"
        />
    );
}
