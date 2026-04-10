import { getBookStories } from "@/lib/actions/book";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useBookStories = ({
    bookId,
    offset = 0,
    limit = 10,
}: {
    bookId: number;
    offset?: number;
    limit?: number;
}) => {
    return useQuery({
        queryKey: ["book-stories", { bookId }],
        queryFn: async () => {
            const data = await getBookStories(bookId, offset, limit);

            if (!data) {
                throw new Error("No stories found for this book");
            } else if (data.length < 1) {
                throw new Error("No more stories found for this book");
            }
            return data;
        },
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 60 * 12, // 12 hours
        gcTime: 1000 * 60 * 60 * 24, // 1 day before hard reset
        enabled: !!bookId,
    });
};
