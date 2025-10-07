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
import { isFeatureSupported } from "@/lib/utils/pwa/is-feature-supported";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateStoryForm() {
    const router = useRouter();

    const [synced, setSynced] = useState(false);

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
                                    message: `A Validation Error Occured -> ${errorMsg}`,
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
                    // check if background sync is available
                    if (isFeatureSupported(["serviceWorker", "SyncManager"])) {
                        setSynced(true);

                        notifications.show({
                            title: "Story Has Been Queued.",
                            message: `Your Story ${args.input.title} Will be Published When You Come Online.`,
                            autoClose: 7000,
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
            disabled: hasSucceeded || isPending || synced,
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
                        loading={isPending || hasSucceeded || synced}
                        rightSection={
                            isPending ? (
                                <Text>Submitting Story...</Text>
                            ) : hasSucceeded ? (
                                <Text>Redirecting To New Story...</Text>
                            ) : synced ? (
                                <Text>Redirecting To Home...</Text>
                            ) : null
                        }
                    >
                        Submit
                    </Button>
                </form>
            </Paper>
        </StoryFormProvider>
    );
}
