"use client";

import { CommentInsertType } from "@/zod-schemas/comment";
import { Textarea, TextareaProps } from "@mantine/core";
import { createFormContext } from "@mantine/form";

type CommentAreaProps = Partial<TextareaProps>;

export const [CommentFormProvider, useCommentFormContext, useCommentForm] =
    createFormContext<CommentInsertType>();

export function CommentArea({ ...props }: CommentAreaProps) {
    const form = useCommentFormContext();

    return (
        <Textarea
            key={form.key("text")}
            {...form.getInputProps("text")}
            {...props}
        />
    );
}
