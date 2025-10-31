

import { createFormContext } from "@mantine/form";

import { StoryUpdateType } from "@/types/story";
import {
    Stack,
    Textarea,
    TextareaProps,
    TextInput,
    TextInputProps,
} from "@mantine/core";
import { ImageDropzone } from "../../ui/dropzone";
import {
    StoryRichTextEditor,
    StoryRichTextEditorProps,
} from "../../ui/rich-text-editor";

export const [
    UpdateStoryFormProvider,
    useUpdateStoryFormContext,
    useUpdateStoryForm,
] = createFormContext<StoryUpdateType>();

export function UpdateStoryFormFields() {
    const form = useUpdateStoryFormContext();

    return (
        <Stack>
            <ImageDropzone
                action="updateStory"
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
            maxRows={8}
            minRows={8}
            autosize
            {...form.getInputProps("blurb")}
            {...props}
        />
    );
}

export function UpdateStoryContent({
    ...props
}: Omit<StoryRichTextEditorProps, "value" | "onChange">) {
    const form = useUpdateStoryFormContext();

    return (
        <StoryRichTextEditor
            key={form.key("content")}
            value={form.values.content}
            {...form.getInputProps("content")}
            {...props}
        />
    );
}
