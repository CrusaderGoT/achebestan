import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { deleteStoryAction } from "../../actions/story";

export const useDeleteStory = (authorId: string) => {
    const boundDeleteStoryAction = useMemo(
        () => deleteStoryAction.bind(null, authorId),
        [authorId],
    );
    const queryClient = useQueryClient();

    const action = useAction(boundDeleteStoryAction, {
        onSuccess(args) {
            const deletedStory = args.data;

            notifications.show({
                message: `Story '${deletedStory.title}' has been deleted`,
                color: "green",
            });

            queryClient.invalidateQueries({
                queryKey: ["read-story", { isbn: deletedStory.isbn }],
            });

            if (deletedStory.bookId && deletedStory.bookPart) {
                // invalidate queries related to the book's stories and story book to reflect the deletion
                queryClient.invalidateQueries({
                    queryKey: ["book-stories", { bookId: deletedStory.bookId }],
                });
                queryClient.invalidateQueries({
                    queryKey: ["story-book", { bookId: deletedStory.bookId }],
                });
            }
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
