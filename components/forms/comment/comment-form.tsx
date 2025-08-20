"use client";

import { useCreateComment } from "@/lib/hooks/comment-hook";
import { commentInsertSchema, CommentInsertType } from "@/zod-schemas/story";
import { Button, Stack, TextareaProps } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
    CommentArea,
    CommentFormProvider,
    useCommentForm,
} from "./comment-form-context";

type CommentFormProps = CommentInsertType &
    TextareaProps & {
        closeCommentForm?: () => void;
    };

export function CommentForm({
    storyISBN,
    parentCommentId,
    closeCommentForm,
    ...props
}: CommentFormProps) {
    const form = useCommentForm({
        initialValues: {
            storyISBN: storyISBN,
            text: "",
            parentCommentId: parentCommentId,
        },
        validate: zod4Resolver(commentInsertSchema),
    });

    const { executeAsync: executeAsyncCreateComment } = useCreateComment();

    async function handleSubmit(data: CommentInsertType) {
        const { data: newComment } = await executeAsyncCreateComment({
            ...data,
        });

        if (newComment) {
            form.reset();

            if (closeCommentForm) {
                closeCommentForm();
            }
        }
    }

    return (
        <CommentFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <CommentArea placeholder="Leave A Comment..." {...props} />
                    <Button type="submit" size="compact-md">
                        submit
                    </Button>
                </Stack>
            </form>
        </CommentFormProvider>
    );
}
