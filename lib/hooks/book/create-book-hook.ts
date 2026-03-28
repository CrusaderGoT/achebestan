import { notifications } from "@mantine/notifications";
import { useAction } from "next-safe-action/hooks";

import { createBookAction } from "@/lib/actions/book";

export const useCreateBook = () => {
    const action = useAction(createBookAction, {
        onSuccess(args) {
            notifications.show({
                message: `Book '${args.data.name.toUpperCase()}' Has Been Created`,
                color: "green",
            });
        },
        onError(args) {
            if (args.error.validationErrors) {
                Object.entries(args.error.validationErrors).forEach(
                    ([field, errorList]) => {
                        // Normalize the errorList to a string[] before iterating.
                        const normalizedErrors: string[] = Array.isArray(
                            errorList
                        )
                            ? errorList
                            : Array.isArray(errorList?._errors)
                            ? errorList._errors
                            : [];

                        normalizedErrors.forEach((errorMsg, index) => {
                            notifications.show({
                                id: `validation-${field}-${index}`, // Better ID generation
                                message: `${field}: ${errorMsg}`,
                                color: "red",
                            });
                        });
                    }
                );
            } else if (args.error.serverError) {
                notifications.show({
                    message: `A server error occurred -> ${args.error.serverError.substring(
                        0,
                        10
                    )}...`,
                    color: "red",
                });
            } else if (args.error.thrownError) {
                notifications.show({
                    message:
                        args.error.thrownError.message || "An error occurred",
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
