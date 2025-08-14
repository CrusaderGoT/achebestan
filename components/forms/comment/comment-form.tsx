"use client";

import { commentInsertSchema, CommentInsertType } from "@/zod-schemas/story";
import { Button, Stack } from "@mantine/core";
import { zod4Resolver } from "mantine-form-zod-resolver";
import {
    CommentArea,
    CommentFormProvider,
    useCommentForm,
} from "./comment-form-context";

type CommentFormProps = {
    storyISBN: string;
};

export function CommentForm({ storyISBN }: CommentFormProps) {
    const form = useCommentForm({
        initialValues: {
            storyISBN: storyISBN,
            text: "defaukt",
        },
        validate: zod4Resolver(commentInsertSchema),
    });

    async function handleSubmit(data: CommentInsertType) {
        console.error(JSON.stringify(data));
    }

    return (
        <CommentFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <CommentArea />
                    <Button type="submit" size="compact-md">
                        submit
                    </Button>
                </Stack>
            </form>
        </CommentFormProvider>
    );
}
