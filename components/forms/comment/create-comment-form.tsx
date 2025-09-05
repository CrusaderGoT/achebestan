"use client";

import {
    CreateCommentArea,
    CreateCommentFormProvider,
    useCreateCommentForm,
} from "@/components/forms/comment/create-comment-form-context";
import { useCreateComment } from "@/lib/hooks/comment/comment-hook";
import { commentInsertSchema, CommentInsertType } from "@/zod-schemas/comment";
import { Button, Stack, TextareaProps } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";

type CommentFormProps = CommentInsertType &
    TextareaProps & {
        closeCommentForm?: () => void;
    };

export function CreateCommentForm({
    storyISBN,
    parentCommentId,
    closeCommentForm,
    ...props
}: CommentFormProps) {
    const form = useCreateCommentForm({
        initialValues: {
            storyISBN: storyISBN,
            text: "",
            parentCommentId: parentCommentId,
        },
        validate: zod4Resolver(commentInsertSchema),
    });

    const { executeAsync: executeAsyncCreateComment, isPending } =
        useCreateComment();

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
        <CreateCommentFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <CreateCommentArea
                        placeholder="Leave A Comment..."
                        {...props}
                    />
                    <Button type="submit" size="compact-md" loading={isPending}>
                        submit
                    </Button>
                </Stack>
            </form>
        </CreateCommentFormProvider>
    );
}
