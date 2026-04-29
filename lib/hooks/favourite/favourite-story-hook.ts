import {
    favouriteStoryAction,
    getfavouriteUserStory,
} from "@/lib/actions/favourite";
import { notifications } from "@mantine/notifications";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";

export const useFavouriteStory = (actionType: "insert" | "delete") => {
    const queryClient = useQueryClient();

    const boundFavouriteStoryAction = useMemo(
        () => favouriteStoryAction.bind(null, actionType),
        [actionType],
    );

    const action = useAction(boundFavouriteStoryAction, {
        onSuccess(args) {
            if (!args.data.success) {
                notifications.show({
                    message: "Failed To Make Story A Favourite",
                    color: "orange",
                });
            } else if (args.data.created) {
                notifications.show({
                    message: "Story Is Now A Favourite",
                    color: "red",
                });
            } else if (args.data.deleted) {
                notifications.show({
                    message: "Story Has Been Removed As A Favourite",
                    color: "gray",
                });
            }
            queryClient.invalidateQueries({
                queryKey: [
                    "favourite-status",
                    { userId: args.data.userId, storyId: args.data.storyId },
                ],
            });
        },
        onError(args) {
            if (args.error.validationErrors) {
                Object.values(args.error.validationErrors).forEach(
                    (errorMsg) => {
                        errorMsg.forEach((err) =>
                            notifications.show({
                                message: `A Validation Error Occured -> ${err}`,
                                color: "red",
                            }),
                        );
                    },
                );
            } else if (args.error.serverError) {
                notifications.show({
                    message:
                        args.error.serverError || "A server error occurred",
                    color: "red",
                });
            } else if (args.error.thrownError) {
                notifications.show({
                    message:
                        args.error.thrownError.message ||
                        "An unexpected error occurred",
                    color: "red",
                });
            } else {
                notifications.show({
                    message: "An unexpected error occurred",
                    color: "red",
                });
            }
        },
    });

    return action;
};

export const useFavouriteStatus = ({
    userId,
    storyId,
    postProcessInitialFetch,
}: {
    userId: string | undefined;
    storyId: number;
    postProcessInitialFetch: (favStatus: boolean) => void;
}) => {
    return useQuery({
        queryKey: ["favourite-status", { userId, storyId }],
        queryFn: async () => {
            if (!userId)
                throw new Error(
                    "User ID is required to fetch favourite status",
                );

            const favourite = await getfavouriteUserStory(userId, storyId);

            const favStatus = !!favourite;

            postProcessInitialFetch(favStatus);

            return favStatus;
        },
        enabled: !!userId && !!storyId,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};
