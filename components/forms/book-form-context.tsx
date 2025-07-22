"use client";

import { createFormContext } from "@mantine/form";

import { BookInsertType } from "@/drizzle/schemas/book";
import { Paper, Stack, TextInput } from "@mantine/core";
import { ImageUpload } from "../ui/dropzone";
import { BookRichTextEditor } from "../ui/rich-text-editor";

export const [BookFormProvider, useBookFormContext, useBookForm] =
    createFormContext<BookInsertType>();

export function BookFormFields() {
    const form = useBookFormContext();

    return (
        <Paper withBorder p={"xl"}>
            <Stack>
                <ImageUpload maxFiles={1} />

                <TextInput
                    key={form.key("title")}
                    label="Title"
                    {...form.getInputProps("title")}
                />

                <TextInput
                    label="Subtitle"
                    key={form.key("subtitle")}
                    {...form.getInputProps("subtitle")}
                />

                <BookRichTextEditor
                    key={form.key("content")}
                    value={form.values.content}
                    error={form.getInputProps("content").error}
                    {...form.getInputProps("content")}
                />
            </Stack>
        </Paper>
    );
}
