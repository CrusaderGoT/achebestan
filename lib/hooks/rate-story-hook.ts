import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";
import { rateStoryAction } from "../actions/story";

export const useRateStory = () => {
    const action = useAction(rateStoryAction, {
        onSuccess(args) {
            if (typeof args?.data?.stars == "number") {
                // fail safe to ensure rating was a success
                notifications.show({
                    message:
                        args.data.stars < 3
                            ? "Sorry You Did Not Like The Story, Hope It Grows On You"
                            : "Thank You For Rating",

                    color: "yellow",
                });
            } else {
                notifications.show({
                    message: "Your Rating Failed",
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
