"use client";

import { useUpdateComment } from "@/lib/hooks/comment/comment-hook";
import { commentUpdateSchema, CommentUpdateType } from "@/zod-schemas/comment";
import { Button, Stack, TextareaProps } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useState } from "react";
import {
    UpdateCommentArea,
    UpdateCommentFormProvider,
    useUpdateCommentForm,
} from "./update-comment-form-context";

type CommentFormProps = CommentUpdateType &
    TextareaProps & {
        closeCommentForm?: () => void;
        commentId: number;
    };

export function UpdateCommentForm({
    text,
    commentId,
    userId,
    storyISBN,
    closeCommentForm,
    ...props
}: CommentFormProps) {
    const form = useUpdateCommentForm({
        initialValues: {
            storyISBN: storyISBN,
            text: text,
            userId: userId,
        },
        validate: zod4Resolver(commentUpdateSchema),
    });

    const { executeAsync: executeAsyncUpdateComment, isPending } =
        useUpdateComment();

    async function handleSubmit(data: CommentUpdateType) {
        const { data: editedComment } = await executeAsyncUpdateComment({
            ...data,
            commentId: commentId,
        });

        if (editedComment) {
            if (closeCommentForm) {
                closeCommentForm();
            }
        }
    }

    const [dirty, setDirty] = useState(false);

    form.watch("text", ({ dirty }) => {
        setDirty(dirty);
    });

    return (
        <UpdateCommentFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <UpdateCommentArea {...props} />
                    <Button
                        type="submit"
                        size="compact-md"
                        loading={isPending}
                        disabled={!dirty}
                    >
                        edit
                    </Button>
                </Stack>
            </form>
        </UpdateCommentFormProvider>
    );
}
