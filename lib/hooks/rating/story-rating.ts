import { getStoryRatings } from "@/lib/actions/rating";
import { useQuery } from "@tanstack/react-query";

export const useStoryRating = ({ isbn }: { isbn: string }) => {
    return useQuery({
        queryKey: ["story-ratings", { isbn }],
        queryFn: async () => {
            const data = await getStoryRatings(isbn);

            if (!data) {
                throw new Error("Story has no rating yet");
            }

            return data;
        },
    });
};
