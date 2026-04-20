import {
    calculateStoryPermissions,
    canCreateStory,
} from "@/lib/auth/policies/story-policy";
import { UserSelectType } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export const useStoryPermissions = ({
    user,
    storyId,
    authorId,
}: {
    user: UserSelectType | undefined;
    storyId: number | undefined;
    authorId: string | undefined;
}) => {
    return useQuery({
        queryKey: [
            "story-permissions",
            { userId: user?.id, storyId, authorId },
        ],
        queryFn: async () => {
            if (!storyId || !authorId) {
                throw new Error(
                    "story-id and author-id must exist before you can check story permissions",
                );
            }

            const data = await calculateStoryPermissions(user, {
                id: storyId,
                authorId,
            });

            if (!data) {
                throw new Error("Failed to get permissions for this story");
            }

            return data;
        },
        staleTime: 1000 * 60 * 60, // 1 hour fresh
        gcTime: 1000 * 60 * 60 * 24, // keep in cache 24h
        enabled: !!user && !!storyId && !!authorId,
    });
};

export const useCanCreateStory = ({
    userId,
}: {
    userId: string | undefined;
}) => {
    return useQuery({
        queryKey: ["can-create-story", { userId }],
        queryFn: async () => {
            try {
                const data = await canCreateStory();

                return data;
            } catch {
                throw new Error(
                    "Failed to check if this user can create stories",
                );
            }
        },
        enabled: !!userId,
    });
};
