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
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateStoryForm() {
    const router = useRouter();

    const [synced, setSynced] = useState(false)

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
                    
                     setSynced(true);
  router.replace("/");
                        notifications.show({
                            message: `Your Story ${args.input.title} Will be Published When You Come Online.`,
                        });
                        
                    
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
