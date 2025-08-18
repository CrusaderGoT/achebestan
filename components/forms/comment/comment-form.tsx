"use client";

import { useCreateComment } from "@/lib/hooks/comment-hook";
import { commentInsertSchema, CommentInsertType } from "@/zod-schemas/story";
import { Button, Stack } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";
import {
    CommentArea,
    CommentFormProvider,
    useCommentForm,
} from "./comment-form-context";

type CommentFormProps = {
    storyISBN: string;
};

export function CommentForm({ storyISBN }: CommentFormProps) {
    const router = useRouter();

    const form = useCommentForm({
        initialValues: {
            storyISBN: storyISBN,
            text: "",
        },
        validate: zod4Resolver(commentInsertSchema),
    });

    const { executeAsync: executeAsyncCreateComment } = useCreateComment();

    async function handleSubmit(data: CommentInsertType) {
        const { data: newComment } = await executeAsyncCreateComment({
            ...data,
        });

        if (newComment) {
            router.refresh();
        }
    }

    return (
        <CommentFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <CommentArea placeholder="Leave A Comment..." />
                    <Button type="submit" size="compact-md">
                        submit
                    </Button>
                </Stack>
            </form>
        </CommentFormProvider>
    );
}
