"use client";

import { CommentInsertType } from "@/zod-schemas/comment";
import { Textarea, TextareaProps } from "@mantine/core";
import { createFormContext } from "@mantine/form";

type CommentAreaProps = Partial<TextareaProps>;

export const [
    CreateCommentFormProvider,
    useCreateCommentFormContext,
    useCreateCommentForm,
] = createFormContext<CommentInsertType>();

export function CreateCommentArea({ ...props }: CommentAreaProps) {
    const form = useCreateCommentFormContext();

    return (
        <Textarea
            key={form.key("text")}
            {...form.getInputProps("text")}
            {...props}
        />
    );
}
