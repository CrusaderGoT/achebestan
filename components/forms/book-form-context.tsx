"use client";

import { createFormContext } from "@mantine/form";

import { BookInsertType } from "@/drizzle/schemas/book";
import { Paper } from "@mantine/core";
import { ImageUpload } from "../ui/dropzone";

export const [BookFormProvider, useBookFormContext, useBookForm] =
    createFormContext<BookInsertType>();

export function BookFormFields() {
    //const form = useBookFormContext();

    return (
        <Paper withBorder>
            <ImageUpload />
        </Paper>
    );
}
