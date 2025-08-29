import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";
import { deleteStoryRating } from "../actions/story";

export const useDeleteRating = () => {
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
