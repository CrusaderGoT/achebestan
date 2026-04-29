import {
    readLatestStories,
    readStory,
    searchStories,
} from "@/lib/actions/story";
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
        staleTime: Infinity, // Data is considered fresh indefinitely, freshness is managed by updateTag in actions
    });
};

export const useReadLatestStories = ({ limit }: { limit?: number } = {}) => {
    return useQuery({
        queryKey: ["read-latest-stories"],
        queryFn: async () => {
            const res = await readLatestStories(limit);
            return res || [];
        },
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};

export const useSearchStory = ({
    query,
    limit = 20,
}: {
    query: string;
    limit?: number;
}) => {
    return useQuery({
        queryKey: ["search-story", query],
        queryFn: () => searchStories(query, { limit: limit }),
        enabled: query.trim().length > 0, // Only run if there is text
        staleTime: 1000 * 60 * 2, // Cache search results for 2 minutes
    });
};
