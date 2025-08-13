"use client";

import { Button, Stack } from "@mantine/core";
import {
    CommentArea,
    CommentFormProvider,
    useCommentForm,
} from "./comment-form-context";

export function CommentForm() {
    const form = useCommentForm();

    return (
        <CommentFormProvider form={form}>
            <form>
                <Stack>
                    <CommentArea />
                    <Button type="submit">submit</Button>
                </Stack>
            </form>
        </CommentFormProvider>
    );
}
