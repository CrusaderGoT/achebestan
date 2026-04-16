import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { rateStoryAction } from "../../actions/rating";

export const useRateStory = () => {
    const queryClient = useQueryClient();

    const action = useAction(rateStoryAction, {
        onSuccess({ data, input }) {
            if (data) {
                notifications.show({
                    message:
                        data.stars < 3
                            ? "Sorry you didn't like it!"
                            : "Thank you for rating!",
                    color: "yellow",
                });
            }

            queryClient.invalidateQueries({
                queryKey: [
                    "user-rating",
                    { userId: input.userId, isbn: input.storyISBN },
                ],
            });

            queryClient.invalidateQueries({
                queryKey: ["story-ratings", { isbn: input.storyISBN }],
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
