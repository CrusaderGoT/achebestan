import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";
import {
    createCommentAction,
    deleteCommentAction,
    updateCommentAction,
} from "../actions/story";








export const useCreateComment = () => {
    const action = useAction(createCommentAction, {
        onSuccess() {
            notifications.show({
                message: "Your Comment Has Been Added",
            });
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

export const useUpdateComment = () => {
    const action = useAction(updateCommentAction, {
        onSuccess() {
            notifications.show({
                message: "Your Comment Has Been Edited",
                color: "green",
            });
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

export const useDeleteComment = () => {
    const action = useAction(deleteCommentAction, {
        onSuccess() {
            notifications.show({
                message: "Your Comment Has Been Deleted",
                color: "yellow",
            });
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
