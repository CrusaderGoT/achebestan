import { favouriteStoryAction } from "@/lib/actions/favourite";
import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";

export const useFavouriteStory = (actionType: "insert" | "delete") => {
    const boundFavouriteStoryAction = useMemo(
        () => favouriteStoryAction.bind(null, actionType),
        [actionType]
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
        },
        onError(args) {
            if (args.error.validationErrors) {
                Object.values(args.error.validationErrors).forEach(
                    (errorMsg) => {
                        errorMsg.forEach((err) =>
                            notifications.show({
                                message: `A Validation Error Occured -> ${err}`,
                                color: "red",
                            })
                        );
                    }
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
