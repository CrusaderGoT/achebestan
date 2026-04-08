import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";
import { useMemo } from "react";
import { updateStoryAction } from "../../actions/story";

import { usePathname, useRouter } from "next/navigation";

export const useUpdateStory = (isbn: string, authorId: string) => {
    const router = useRouter();

    const pathname = usePathname();

    const boundUpdateStoryAction = useMemo(
        () => updateStoryAction.bind(null, isbn, authorId),
        [isbn, authorId],
    );

    const action = useAction(boundUpdateStoryAction, {
        onSuccess(args) {
            const storyTitle = args.data.title;

            notifications.show({
                message: `Story '${storyTitle.toUpperCase()}' Has Been Updated`,
                color: "green",
            });

            if (pathname === `/story/${args.data.isbn}`) {
                router.refresh();
            } else {
                router.push(`/story/${args.data.isbn}`);
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
