"use client";

import { bookStories } from "@/lib/actions/story";
import { Pagination } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function BookPagination({
    bookId,
    bookPart,
}: {
    bookId: number;
    bookPart: number;
}) {
    const router = useRouter();

    const [chapters, setChapters] = useState<
        Awaited<ReturnType<typeof bookStories>>
    >([]);

    // fetch the book parts using the bookId
    useEffect(() => {
        async function getBookParts() {
            const bookParts = await bookStories(bookId, bookPart);

            if (bookParts) {
                setChapters(bookParts);
            }
        }

        getBookParts();
    });

    function chunk<T>(array: T[], size: number): T[][] {
        if (!array.length) {
            return [];
        }
        const head = array.slice(0, size);
        const tail = array.slice(size);
        return [head, ...chunk(tail, size)];
    }

    const data = chunk(chapters, chapters.length);

    const [activePage, setActivePage] = useState(1);

    const handleNextBookPage = useCallback(
        (e: number) => {
            // get chapter with the part number
            setActivePage(e);
            const chapterISBN = chapters.filter((c) => c.bookPart === e);
            router.push(`/story/${chapterISBN}`);
        },
        [chapters, router]
    );

    return (
        <Pagination
            value={activePage}
            onChange={(e) => {
                handleNextBookPage(e);
            }}
            total={data.length}
        />
    );
}
