import { getUserRating } from "@/lib/actions/rating";
import { useQuery } from "@tanstack/react-query";

export const useUserRating = ({
    isbn,
    userId,
}: {
    isbn: string;
    userId: string | undefined;
}) => {
    return useQuery({
        queryKey: ["user-rating", { userId, isbn }],
        queryFn: async () => {
            if (!userId) {
                throw new Error("User ID is required to fetch user rating");
            }

            const data = await getUserRating(userId, isbn);

            if (!data) {
                throw new Error("No user rating");
            }

            return data;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 60 * 12, // 12 hours
        gcTime: 1000 * 60 * 60 * 24, // 1 day before hard reset
    });
};
