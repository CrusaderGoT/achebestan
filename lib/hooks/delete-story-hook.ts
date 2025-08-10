import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { deleteStoryAction } from "../actions/story";

export const useDeleteStory = (authorId: string) => {
    const boundDeleteStoryAction = useMemo(
        () => deleteStoryAction.bind(null, authorId),
        [authorId]
    );

    const action = useAction(boundDeleteStoryAction, {
        onSuccess(args) {
            const storyTitle = args.data.title;

            notifications.show({
                message: `Story '${storyTitle}' Has Been Deleted`,
                color: "green",
            });
        },
        onError(args) {
            if (args.error.serverError) {
                notifications.show({
                    message:
                        args.error.serverError || "A Server Error Occurred",
                    color: "red",
                });
            } else if (args.error.thrownError) {
                notifications.show({
                    message:
                        args.error.thrownError.message ||
                        "An Unexpected Error Occurred",
                    color: "red",
                });
            } else {
                notifications.show({
                    message: "An Unexpected Error Occurred",
                    color: "red",
                });
            }
        },
        onNavigation(args) {
            if (args.navigationKind === "redirect") {
                notifications.show({
                    message: "Story Has Been Deleted.",
                });
            }
        },
    });

    return action;
};
