"use client";

import {
    UpdateStoryFormFields,
    UpdateStoryFormProvider,
    useUpdateStoryForm,
} from "@/components/forms/story/update-story-form-context";

import {
    storyUpdateSchema,
} from "@/zod-schemas/story";
import { StorySelectType } from "@/types/story";
import { StoryUpdateType } from "@/types/story";

import { Button, Paper } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";

import { useUpdateStory } from "@/lib/hooks/story/update-story";
import { LoadingOverlayWithText } from "../../ui/loading-overlay-with-text";

export function UpdateStoryForm({ story }: { story: StorySelectType }) {
    const form = useUpdateStoryForm({
        mode: "uncontrolled",
        validate: zod4Resolver(storyUpdateSchema),
    });

    const { executeAsync, isPending, hasSucceeded } = useUpdateStory(
        story.isbn, story.authorId
    );

    async function handleSubmit(data: StoryUpdateType) {
        await executeAsync({
            ...data,
        });
    }

    return (
        <UpdateStoryFormProvider form={form}>
            <Paper withBorder p={"xl"} pos={"relative"}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <UpdateStoryFormFields />

                    <Button type="submit" loading={isPending || hasSucceeded}>
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
        </UpdateStoryFormProvider>
    );
}
