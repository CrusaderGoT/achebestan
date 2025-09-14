import { dislikeCommentAction, likeCommentAction } from "@/lib/actions/comment";
import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";

export const useLikeComment = () => {
    const router = useRouter();

    const action = useAction(likeCommentAction, {
        onSuccess() {
            router.refresh();
        },
        onError(args) {
            if (args.error.validationErrors) {
                Object.values(args.error.validationErrors).forEach(
                    (errorMsg) => {
                        if (Array.isArray(errorMsg)) {
                            errorMsg.forEach((err) =>
                                notifications.show({
                                    message: `A Validation Error Occured -> ${err}`,
                                    color: "red",
                                })
                            );
                        } else if (typeof errorMsg === "object") {
                            errorMsg._errors?.forEach((err) =>
                                notifications.show({
                                    message: `A Validation Error Occured -> ${err}`,
                                    color: "red",
                                })
                            );
                        }
                    }
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

export const useDislikeComment = () => {
    const router = useRouter();

    const action = useAction(dislikeCommentAction, {
        onSuccess() {
            router.refresh();
        },
        onError(args) {
            if (args.error.validationErrors) {
                Object.values(args.error.validationErrors).forEach(
                    (errorMsg) => {
                        if (Array.isArray(errorMsg)) {
                            errorMsg.forEach((err) =>
                                notifications.show({
                                    message: `A Validation Error Occured -> ${err}`,
                                    color: "red",
                                })
                            );
                        } else if (typeof errorMsg === "object") {
                            errorMsg._errors?.forEach((err) =>
                                notifications.show({
                                    message: `A Validation Error Occured -> ${err}`,
                                    color: "red",
                                })
                            );
                        }
                    }
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
