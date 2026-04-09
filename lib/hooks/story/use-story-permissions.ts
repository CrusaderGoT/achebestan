import { calculateStoryPermissions } from "@/lib/auth/policies/story-policy";
import { UserSelectType } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export const useStoryPermissions = ({
    user,
    storyId,
    authorId,
}: {
    user: UserSelectType | undefined;
    storyId: number;
    authorId: string;
}) => {
    return useQuery({
        queryKey: ["storyPermissions", { userId: user?.id, storyId, authorId }],
        queryFn: async () => {
            try {
                const data = await calculateStoryPermissions(user, {
                    id: storyId,
                    authorId,
                });

                return data;
            } catch {
                throw new Error("Failed to get permissions for this story");
            }
        },
        staleTime: 1000 * 60 * 60, // 1 hour fresh
        gcTime: 1000 * 60 * 60 * 24, // keep in cache 24h
        enabled: !!user && !!storyId,
    });
};
