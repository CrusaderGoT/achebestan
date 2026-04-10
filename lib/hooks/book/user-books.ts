import { getUserBooks } from "@/lib/actions/book";
import { ComboboxData } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

export const useUserBooks = ({
    userId,
    offset,
    limit,
}: {
    userId: string | undefined;
    offset: number;
    limit: number;
}) => {
    return useQuery({
        queryKey: ["user-books", { userId }],
        queryFn: async () => {
            if (!userId) {
                throw new Error("User ID is required to fetch user books");
            }

            const data = await getUserBooks({ userId, offset, limit });

            if (!data || data.length < 1) {
                throw new Error("This user has no books/story-collection yet");
            }

            const normalizedData: ComboboxData = data.map((d) => {
                return {
                    value: `${d.id}`,
                    label: d.name,
                };
            });

            return normalizedData;
        },
        staleTime: 1000 * 60 * 60 * 6, // 6 hours
        gcTime: 1000 * 60 * 60 * 24, // 12 hrs before hard reset
        enabled: !!userId,
    });
};
