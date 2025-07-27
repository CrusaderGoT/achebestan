"use client";

import { createFormContext } from "@mantine/form";

import { StoryUpdateType } from "@/zod-schemas/story";
import { Stack, TextInput, TextInputProps } from "@mantine/core";
import { StoryImageDropzone } from "../../ui/dropzone";
import { StoryRichTextEditor } from "../../ui/rich-text-editor";

export const [
    UpdateStoryFormProvider,
    useUpdateStoryFormContext,
    useUpdateStoryForm,
] = createFormContext<StoryUpdateType>();

export function UpdateStoryFormFields() {
    const form = useUpdateStoryFormContext();

    return (
        <Stack>
            <StoryImageDropzone
                action="update"
                form={form}
                maxFiles={1}
                field="image"
            />

            <UpdateStoryTitle />

            <UpdateStorySubtitle />

            <UpdateStoryContent />
        </Stack>
    );
}

type UpdateStoryTitleType = Partial<TextInputProps>;

export function UpdateStoryTitle({ ...props }: UpdateStoryTitleType) {
    const form = useUpdateStoryFormContext();

    return (
        <TextInput
            label="Title"
            key={form.key("title")}
            {...form.getInputProps("title")}
            {...props}
        />
    );
}

type UpdateStorySubtitleType = Partial<TextInputProps>;

export function UpdateStorySubtitle({ ...props }: UpdateStorySubtitleType) {
    const form = useUpdateStoryFormContext();

    return (
        <TextInput
            label="Subtitle"
            key={form.key("subtitle")}
            {...form.getInputProps("subtitle")}
            {...props}
        />
    );
}

export function UpdateStoryContent() {
    const form = useUpdateStoryFormContext();
    return (
        <StoryRichTextEditor
            key={form.key("content")}
            value={form.values.content}
            error={form.getInputProps("content").error}
            {...form.getInputProps("content")}
        />
    );
}
