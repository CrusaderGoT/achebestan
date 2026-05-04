import { getBookAndStories } from "@/lib/actions/book";
import { useQuery } from "@tanstack/react-query";

export const useStoryBook = ({ bookId }: { bookId: number | null }) => {
    return useQuery({
        queryKey: ["story-book", { bookId }],
        queryFn: async () => {
            if (!bookId) {
                throw new Error(
                    "A book ID must be provided to fetch the story book",
                );
            }

            const data = await getBookAndStories(bookId);

            if (!data) {
                throw new Error("The story book could not be found");
            }

            return data;
        },
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week before hard reset
        enabled: !!bookId,
    });
};
