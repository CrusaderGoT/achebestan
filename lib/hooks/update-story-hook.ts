import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";
import { redirect, useRouter } from "next/navigation";
import { updateStoryAction } from "../actions/story";

export const useUpdateStory = (isbn: string) => {
    const router = useRouter();

    const boundUpdateStoryAction = updateStoryAction.bind(null, isbn);

    const action = useAction(boundUpdateStoryAction, {
        onSuccess(args) {
            notifications.show({
                message: `Story '${args.data.title.toLocaleUpperCase()}' Has Been Updated`,
            });

            if (args.input.image && !args.data.image) {
                notifications.show({
                    message:
                        "Image Of The Story Failed To Upload. Try Again Via Editing Story Image",
                    color: "red",
                });
            }

            router.refresh();

            redirect(`/story/${args.data.isbn}`);
        },
        onError(args) {
            if (args.error.validationErrors) {
                Object.values(args.error.validationErrors).forEach(
                    (errorList) => {
                        // change to alert later
                        errorList.forEach((errorMsg, index) =>
                            notifications.show({
                                key: index,
                                message: `A Field Error Occured -> ${errorMsg}`,
                            })
                        );
                    }
                );
            } else if (args.error.serverError) {
                notifications.show({
                    message: args.error.serverError
                        ? args.error.serverError
                        : "An Error Occured",
                });
            } else if (args.error.thrownError) {
                notifications.show({
                    message: args.error.thrownError
                        ? args.error.thrownError.message
                        : "An Error Occured",
                });
            } else {
                notifications.show({
                    message: "An Error Occured",
                });
            }
        },
    });

    return action;
};
