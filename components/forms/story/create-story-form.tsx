"use client";

import {
    StoryFormFields,
    StoryFormProvider,
    useStoryForm,
} from "@/components/forms/story/create-story-form-context";

import { storyInsertSchema, StoryInsertType } from "@/zod-schemas/story";

import { Button, Paper } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { zod4Resolver } from "mantine-form-zod-resolver";

import { createStoryAction } from "@/lib/actions/story";
import { useAction } from "next-safe-action/hooks";
import { redirect } from "next/navigation";
import { LoadingOverlayWithText } from "../../ui/loading-overlay-with-text";

export function StoryForm() {
    const form = useStoryForm({
        mode: "uncontrolled",
        validate: zod4Resolver(storyInsertSchema),
    });

    const { executeAsync, isPending, hasSucceeded } = useAction(
        createStoryAction,
        {
            onSuccess(args) {
                notifications.show({
                    message: `Story '${args.data.title.toLocaleUpperCase()}' Has Been Published`,
                });

                if (args.input.image && !args.data.image) {
                    notifications.show({
                        message:
                            "Image Of The Story Failed To Upload. Try Again Via Editing Story",
                    });
                }

                redirect(`/story/${args.data.isbn}`);
            },
            onError(args) {
                if (args.error.validationErrors) {
                    console.log(args.error.validationErrors);
                    Object.values(args.error.validationErrors).forEach(
                        (errorList) => {
                            // change to alert later
                            errorList.forEach((errorMsg, index) =>
                                notifications.show({
                                    key: index,
                                    message: `A Field Error Error ${errorMsg}`,
                                })
                            );
                        }
                    );
                } else if (args.error.serverError) {
                    console.log(args.error.serverError);
                    notifications.show({
                        message: args.error.serverError
                            ? args.error.serverError
                            : "An Error Ocured",
                    });
                } else {
                    notifications.show({
                        message: "An Error Ocured",
                    });
                }
            },
        }
    );

    async function handleSubmit(data: StoryInsertType) {
        await executeAsync({
            ...data,
        });
    }

    return (
        <StoryFormProvider form={form}>
            <Paper withBorder p={"xl"} pos={"relative"}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <StoryFormFields />

                    <Button
                        type="submit"
                        mt="md"
                        color="green"
                        loading={isPending || hasSucceeded}
                    >
                        Submit
                    </Button>
                </form>

                {(isPending || hasSucceeded) && (
                    <LoadingOverlayWithText
                        text={
                            isPending
                                ? "Submitting Story..."
                                : hasSucceeded
                                ? "Redirecting To New Story"
                                : ""
                        }
                        visible={isPending || hasSucceeded}
                    />
                )}
            </Paper>
        </StoryFormProvider>
    );
}
