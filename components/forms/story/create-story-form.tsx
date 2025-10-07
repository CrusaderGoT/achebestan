"use client";

import {
    StoryFormFields,
    StoryFormProvider,
    useStoryForm,
} from "@/components/forms/story/create-story-form-context";

import { StoryInsertType } from "@/types/story";
import { storyInsertSchema } from "@/zod-schemas/story";

import { Button, Paper, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { zod4Resolver } from "mantine-form-zod-resolver";

import { createStoryAction } from "@/lib/actions/story";
import { useNetwork } from "@mantine/hooks";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";

export function CreateStoryForm() {
    const router = useRouter();

    const network = useNetwork();

    const { executeAsync, isPending, hasSucceeded } = useAction(
        createStoryAction,
        {
            onSuccess(args) {
                // Normal online success
                notifications.show({
                    message: `Story '${args.data.title.toLocaleUpperCase()}' Has Been Published`,
                });

                router.replace(`/story/${args.data.isbn}`);
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
                                    message: `A Validation Error Error ${errorMsg}`,
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
                    // check if offline and then show notification
                    // request will auto try again when online via background sync
                    if (!network.online) {
                        notifications.show({
                            message: `Your Story ${args.input.title} Will be Published When You Come Online.`,
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
        }
    );

    const form = useStoryForm({
        mode: "uncontrolled",
        validate: zod4Resolver(storyInsertSchema),
        enhanceGetInputProps: () => ({
            disabled: hasSucceeded || isPending,
        }),
    });

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
                        rightSection={
                            isPending ? (
                                <Text>Submitting Story...</Text>
                            ) : hasSucceeded ? (
                                <Text>Redirecting To New Story...</Text>
                            ) : (
                                <Text>Redirecting To Home...</Text>
                            )
                        }
                    >
                        Submit
                    </Button>
                </form>
            </Paper>
        </StoryFormProvider>
    );
}
