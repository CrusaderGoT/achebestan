"use client";

import { Stack, Textarea, TextInput } from "@mantine/core";
import { createFormContext } from "@mantine/form";

import storypageStyles from "@/styles/story-page.module.css";

import { StoryInsertType } from "@/zod-schemas/story";

import { StoryImageDropzone } from "../../ui/dropzone";
import { StoryRichTextEditor } from "../../ui/rich-text-editor";

export const [StoryFormProvider, useStoryFormContext, useStoryForm] =
    createFormContext<StoryInsertType>();

export function StoryFormFields() {
    const form = useStoryFormContext();

    return (
        <Stack>
            <StoryImageDropzone
                maxFiles={1}
                action="create"
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
                key={form.key("blurb")}
                {...form.getInputProps("blurb")}
                maxRows={8}
            />

            <StoryRichTextEditor
                key={form.key("content")}
                value={form.values.content}
                error={form.getInputProps("content").error}
                {...form.getInputProps("content")}
                className={storypageStyles.storyContent}
            />
        </Stack>
    );
}
