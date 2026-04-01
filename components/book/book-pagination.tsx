"use client";

import { BookStoriesType } from "@/types/books";
import { Pagination } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function BookPagination({ chapters }: { chapters: BookStoriesType }) {
    const router = useRouter();

    const [activePage, setActivePage] = useState(1);

    const handleNextBookPage = useCallback(
        (e: number) => {
            // get chapter with the part number
            setActivePage(e);
            const chapterISBN = chapters?.filter((c) => c.bookPart === e);
            router.push(`/story/${chapterISBN}`);
        },
        [chapters, router]
    );

    if (!chapters.length) return; // redundant safe gaurd

    return (
        <Pagination
            value={activePage}
            onChange={(e) => {
                handleNextBookPage(e);
            }}
            total={chapters.length}
        />
    );
}
