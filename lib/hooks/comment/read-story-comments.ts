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
        staleTime: Infinity, // Data is considered fresh indefinitely
    });
}
