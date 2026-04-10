import { readStoryComments } from "@/lib/actions/comment";
import { useQuery } from "@tanstack/react-query";

export function useReadStoryComments({ isbn }: { isbn: string }) {
    return useQuery({
        queryKey: ["read-story-comments", { isbn }],
        queryFn: async () => {
            const data = await readStoryComments(isbn);

            if (!data) {
                throw new Error("No Comments Yet");
            }
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60, // 1 hour before hard reset
    });
}
