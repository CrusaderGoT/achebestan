import { createStoryAction } from "@/lib/actions/story";
import { isFeatureSupported } from "@/lib/utils/pwa/is-feature-supported";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

export const useCreateStory = (
    setSynced: Dispatch<SetStateAction<boolean>>,
) => {
    const router = useRouter();

    const queryClient = useQueryClient();

    const action = useAction(createStoryAction, {
        onSuccess(args) {
            const newStory = args.data;

            notifications.show({
                message: `Story '${newStory.title}' Has Been Published`,
            });

            if (newStory.bookId) {
                // add new story to this book client data
                queryClient.invalidateQueries({
                    queryKey: ["book-stories", { bookId: newStory.bookId }],
                });
            }

            router.replace(`/story/${args.data.isbn}`);
        },
        onError(args) {
            if (args.error.validationErrors) {
                console.error(args.error.validationErrors);
                Object.values(args.error.validationErrors).forEach(
                    (errorList) => {
                        errorList.forEach((errorMsg, index) =>
                            notifications.show({
                                key: index,
                                message: `A Validation Error Occured -> ${errorMsg}`,
                            }),
                        );
                    },
                );
            } else if (args.error.serverError) {
                console.error(args.error.serverError);
                notifications.show({
                    message: "A Server Error Occured",
                });
            } else if (args.error.thrownError) {
                if (isFeatureSupported(["serviceWorker", "SyncManager"])) {
                    setSynced(true);

                    notifications.show({
                        title: "Story Has Been Queued.",
                        message: `Your Story ${args.input.title} Will be Published When You Come Online.`,
                        autoClose: 30000,
                    });

                    router.replace("/");
                } else {
                    notifications.show({
                        message: "An Error Ocured",
                    });
                }
            } else {
                notifications.show({
                    message: "An Unexpected Error Ocured",
                });
            }
        },
    });

    return action;
};
