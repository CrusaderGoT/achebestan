import { createStoryAction } from "@/lib/actions/story";
import { isFeatureSupported } from "@/lib/utils/pwa/is-feature-supported";
import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";
import router from "next/router";
import { Dispatch, SetStateAction } from "react";

export const useCreateStory = (
    setSynced: Dispatch<SetStateAction<boolean>>
) => {
    const action = useAction(createStoryAction, {
        onSuccess(args) {
            notifications.show({
                message: `Story '${args.data.title}' Has Been Published`,
            });

            router.replace(`/story/${args.data.isbn}`);
        },
        onError(args) {
            if (args.error.validationErrors) {
                console.log(args.error.validationErrors);
                Object.values(args.error.validationErrors).forEach(
                    (errorList) => {
                        errorList.forEach((errorMsg, index) =>
                            notifications.show({
                                key: index,
                                message: `A Validation Error Occured -> ${errorMsg}`,
                            })
                        );
                    }
                );
            } else if (args.error.serverError) {
                console.log(args.error.serverError);
                notifications.show({
                    message: args.error.serverError
                        ? args.error.serverError
                        : "A Server Error Ocured",
                });
            } else if (args.error.thrownError) {
                if (isFeatureSupported(["serviceWorker", "SyncManager"])) {
                    setSynced(true);

                    notifications.show({
                        title: "Story Has Been Queued.",
                        message: `Your Story ${args.input.title} Will be Published When You Come Online.`,
                        autoClose: 7000,
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
