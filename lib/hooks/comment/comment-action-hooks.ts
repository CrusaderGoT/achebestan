import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";

import { useQueryClient } from "@tanstack/react-query";
import {
    createCommentAction,
    deleteCommentAction,
    deleteCommentThreadAction,
    updateCommentAction,
} from "../../actions/comment";

export const useCreateComment = () => {
    const queryClient = useQueryClient();

    const action = useAction(createCommentAction, {
        onSuccess(args) {
            notifications.show({
                message: "Your Comment Has Been Added",
            });

            // Invalidate the comments query to refetch the updated comments from cache
            queryClient.invalidateQueries({
                queryKey: [
                    "read-story-comments",
                    { isbn: args.data.storyISBN },
                ],
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
                                }),
                            );
                        } else if (typeof errorMsg === "object") {
                            errorMsg._errors?.forEach((err) =>
                                notifications.show({
                                    message: `A Validation Error Occured -> ${err}`,
                                    color: "red",
                                }),
                            );
                        }
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
                                }),
                            );
                        } else if (typeof errorMsg === "object") {
                            errorMsg._errors?.forEach((err) =>
                                notifications.show({
                                    message: `A Validation Error Occured -> ${err}`,
                                    color: "red",
                                }),
                            );
                        }
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

export const useDeleteComment = () => {
    const action = useAction(deleteCommentAction, {
        onSuccess() {
            notifications.show({
                message: "Comment Has Been Deleted",
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
                                }),
                            );
                        } else if (typeof errorMsg === "object") {
                            errorMsg._errors?.forEach((err) =>
                                notifications.show({
                                    message: `A Validation Error Occured -> ${err}`,
                                    color: "red",
                                }),
                            );
                        }
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

export const useDeleteCommentThread = () => {
    const action = useAction(deleteCommentThreadAction, {
        onSuccess() {
            notifications.show({
                message: "Comment Thread Has Been Deleted",
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
                                }),
                            );
                        } else if (typeof errorMsg === "object") {
                            errorMsg._errors?.forEach((err) =>
                                notifications.show({
                                    message: `A Validation Error Occured -> ${err}`,
                                    color: "red",
                                }),
                            );
                        }
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
