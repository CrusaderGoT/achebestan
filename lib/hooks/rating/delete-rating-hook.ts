import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { deleteStoryRating } from "../../actions/rating";

export const useDeleteRating = () => {
    const queryClient = useQueryClient();

    const action = useAction(deleteStoryRating, {
        onSuccess(args) {
            if (args.data?.id) {
                notifications.show({
                    message: "Your Rate Has Been Deleted",
                });
            } else {
                notifications.show({
                    message: "This Rating No Longer Exists",
                });
            }

            queryClient.invalidateQueries({
                queryKey: [
                    "user-rating",
                    { userId: args.data.userId, isbn: args.data.storyISBN },
                ],
            });

            queryClient.invalidateQueries({
                queryKey: ["story-ratings", { isbn: args.data.storyISBN }],
            });
        },
        onError(args) {
            if (args.error.validationErrors) {
                notifications.show({
                    message: `A Validation Error Occured`,
                    color: "red",
                });
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
