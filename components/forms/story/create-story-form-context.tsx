"use client";

import { Box, Stack, Textarea, TextInput } from "@mantine/core";
import { createFormContext } from "@mantine/form";

import storypageStyles from "@/styles/story/story-page.module.css";

import { StoryInsertType } from "@/types/story";

import { LoadingOverlayWithText } from "@/components/ui/loading-overlay-with-text";
import { ImageDropzone } from "../../ui/dropzone";
import { StoryRichTextEditor } from "../../ui/rich-text-editor";

export const [StoryFormProvider, useStoryFormContext, useStoryForm] =
    createFormContext<StoryInsertType>();

export function StoryFormFields({
    isProcessing = false,
}: {
    isProcessing?: boolean;
}) {
    const form = useStoryFormContext();

    return (
        <Stack>
            <ImageDropzone
                maxFiles={1}
                action="createStory"
                form={form}
                field="image"
            />

            <TextInput
                label="Title"
                key={form.key("title")}
                {...form.getInputProps("title")}
            />

            <TextInput
                label="Subtitle"
                key={form.key("subtitle")}
                {...form.getInputProps("subtitle")}
            />

            <Textarea
                label="Blurb"
                description="A description or intro of the story"
                maxRows={8}
                minRows={8}
                autosize
                key={form.key("blurb")}
                {...form.getInputProps("blurb")}
            />

            <Box m={0} p={0} pos={"relative"}>
                <StoryRichTextEditor
                    key={form.key("content")}
                    value={form.values.content}
                    {...form.getInputProps("content")}
                    className={storypageStyles.storyContent}
                />

                <LoadingOverlayWithText
                    text="Submitting"
                    visible={form.submitting || isProcessing}
                />
            </Box>
        </Stack>
    );
}
