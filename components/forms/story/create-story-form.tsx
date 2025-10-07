"use client";

import {
    StoryFormFields,
    StoryFormProvider,
    useStoryForm,
} from "@/components/forms/story/create-story-form-context";

import { StoryInsertType } from "@/types/story";
import { storyInsertSchema } from "@/zod-schemas/story";

import { Button, Paper } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { zod4Resolver } from "mantine-form-zod-resolver";

import { createStoryAction } from "@/lib/actions/story";
import { useNetwork } from "@mantine/hooks";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { LoadingOverlayWithText } from "../../ui/loading-overlay-with-text";

export function CreateStoryForm() {
    const router = useRouter();

    const form = useStoryForm({
        mode: "uncontrolled",
        validate: zod4Resolver(storyInsertSchema),
    });

    const network = useNetwork();

    const { executeAsync, isPending, hasSucceeded } = useAction(
        createStoryAction,
        {
            onExecute(args) {
                // check if offline and then redirect back to home page
                // as request will auto try again when online

                if (!network.online) {
                    router.push(`/`);
                    notifications.show({
                        message: `Your Story ${args.input.title} Will be Published When You Come Online.`,
                    });
                }
            },
            onSuccess(args) {
                notifications.show({
                    message: `Story '${args.data.title.toLocaleUpperCase()}' Has Been Published`,
                });

                router.push(`/story/${args.data.isbn}`);
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
                    router.push(`/`);
                    notifications.show({
                        message: "Your Story Will be Published Later1.",
                    });
                } else {
                    notifications.show({
                        message: "An Error Ocured",
                    });
                    router.push(`/`);
                    notifications.show({
                        message: "Your Story Will be Published Later2.",
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
            <Paper withBorder p={"xs"} pos={"relative"}>
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
