"use client";

import { createFormContext } from "@mantine/form";

import { StoryInsertType } from "@/zod-schemas/story";
import { Stack, TextInput } from "@mantine/core";
import { StoryImageDropzone } from "../ui/dropzone";
import { StoryRichTextEditor } from "../ui/rich-text-editor";

export const [StoryFormProvider, useStoryFormContext, useStoryForm] =
    createFormContext<StoryInsertType>();

export function StoryFormFields() {
    const form = useStoryFormContext();

    return (
        <Stack>
            <StoryImageDropzone maxFiles={1} />

            <TextInput
                key={form.key("title")}
                label="Title"
                {...form.getInputProps("title")}
            />

            <TextInput
                label="Subtitle"
                key={form.key("subtitle")}
                {...form.getInputProps("subtitle")}
            />

            <StoryRichTextEditor
                key={form.key("content")}
                value={form.values.content}
                error={form.getInputProps("content").error}
                {...form.getInputProps("content")}
            />
        </Stack>
    );
}
