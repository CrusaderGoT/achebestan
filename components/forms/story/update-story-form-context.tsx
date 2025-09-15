"use client";

import { createFormContext } from "@mantine/form";

import { StoryUpdateType } from "@/zod-schemas/story";
import {
    Stack,
    Textarea,
    TextareaProps,
    TextInput,
    TextInputProps,
} from "@mantine/core";
import { StoryImageDropzone } from "../../ui/dropzone";
import { StoryRichTextEditor } from "../../ui/rich-text-editor";

import storypageStyles from "@/styles/story-page.module.css";

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

            <UpdateStoryBlurb maxRows={8} />

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

type UpdateStoryBlurbType = Partial<TextareaProps>;

export function UpdateStoryBlurb({ ...props }: UpdateStoryBlurbType) {
    const form = useUpdateStoryFormContext();

    return (
        <Textarea
            label="Blurb"
            description="The description or intro of the story"
            key={form.key("blurb")}
            {...form.getInputProps("blurb")}
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
            className={storypageStyles.storyContent}
        />
    );
}
