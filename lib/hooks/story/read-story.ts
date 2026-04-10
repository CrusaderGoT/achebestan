import { readStory } from "@/lib/actions/story";
import { useQuery } from "@tanstack/react-query";

export const useReadStory = ({ isbn }: { isbn: string }) => {
    return useQuery({
        queryKey: ["read-story", { isbn }],
        queryFn: async () => {
            const data = await readStory(isbn);

            if (!data) {
                throw new Error("Story not found");
            }

            return data;
        },
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60 * 24,
    });
};
