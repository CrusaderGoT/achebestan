import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { updateStoryAction } from "../../actions/story";

import { useQueryClient } from "@tanstack/react-query";

export const useUpdateStory = (isbn: string, authorId: string) => {
    const queryClient = useQueryClient();

    const boundUpdateStoryAction = useMemo(
        () => updateStoryAction.bind(null, isbn, authorId),
        [isbn, authorId],
    );

    const action = useAction(boundUpdateStoryAction, {
        onSuccess(args) {
            const story = args.data;

            notifications.show({
                message: `Story '${story.title}' has been updated`,
                color: "green",
            });

            // manually invalidate if book change
            if (story.bookId) {
                queryClient.invalidateQueries({
                    queryKey: ["story-book", { bookId: story.bookId }],
                });
            }
        },
        onError(args) {
            if (args.error.validationErrors) {
                Object.entries(args.error.validationErrors).forEach(
                    ([field, errorList]) => {
                        errorList.forEach((errorMsg, index) => {
                            notifications.show({
                                id: `validation-${field}-${index}`, // Better ID generation
                                message: `${field}: ${errorMsg}`,
                                color: "red",
                            });
                        });
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
