// comment-crud.ts

import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";

import { CommentInsertType } from "@/zod-schemas/comment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createCommentAction,
    deleteCommentAction,
    deleteCommentThreadAction,
    updateCommentAction,
} from "../../actions/comment";

export const useCreateComment = () => {
    const queryClient = useQueryClient();

    const action = useAction(createCommentAction, {
        onSuccess: (args) => {
            const newComment = args.data;

            notifications.show({
                message: "Your Comment Has Been Added",
            });

            // Invalidate the comments query to refetch the updated comments from cache
            queryClient.invalidateQueries({
                queryKey: [
                    "read-story-comments",
                    { isbn: newComment.storyISBN },
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

export const useCreateCommentTanstack = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (vars: CommentInsertType) => {
            const result = await createCommentAction(vars);

            // Handle potential validation or server errors from next-safe-action
            if (
                result?.validationErrors ||
                result?.serverError ||
                !result?.data
            ) {
                throw new Error("Action failed");
            }

            return result.data;
        },
        onSuccess: async (args) => {
            notifications.show({
                message: "Your Comment Has Been Added",
            });
            // Invalidate the comments query to refetch the updated comments from cache
            queryClient.invalidateQueries({
                queryKey: ["read-story-comments", { isbn: args.storyISBN }],
            });
        },
    });
};

export const useUpdateComment = () => {
    const queryClient = useQueryClient();

    const action = useAction(updateCommentAction, {
        onSuccess(args) {
            const updateComment = args.data;

            notifications.show({
                message: "Your Comment Has Been Edited",
                color: "green",
            });

            // Invalidate the comments query to refetch the updated comments from cache
            queryClient.invalidateQueries({
                queryKey: [
                    "read-story-comments",
                    { isbn: updateComment.storyISBN },
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

export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    const action = useAction(deleteCommentAction, {
        onSuccess(args) {
            const deletedComment = args.data;

            notifications.show({
                message: "Comment Has Been Deleted",
                color: "green",
            });

            // Invalidate the comments query to refetch the updated comments from cache
            queryClient.invalidateQueries({
                queryKey: [
                    "read-story-comments",
                    { isbn: deletedComment.storyISBN },
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

export const useDeleteCommentThread = () => {
    const queryClient = useQueryClient();

    const action = useAction(deleteCommentThreadAction, {
        onSuccess(args) {
            const deletedComment = args.data;

            notifications.show({
                message: "Comment Thread Has Been Deleted",
                color: "green",
            });

            // Invalidate the comments query to refetch the updated comments from cache
            queryClient.invalidateQueries({
                queryKey: [
                    "read-story-comments",
                    { isbn: deletedComment.storyISBN },
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
