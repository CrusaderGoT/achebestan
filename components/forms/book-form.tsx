"use client";

import {
    BookFormFields,
    BookFormProvider,
    useBookForm,
} from "@/components/forms/book-form-context";

import { bookInsertSchema } from "@/drizzle/schemas/book";

import { Button } from "@mantine/core";

import { zod4Resolver } from "mantine-form-zod-resolver";

export function BookForm() {
    const form = useBookForm({
        validate: zod4Resolver(bookInsertSchema),
    });

    return (
        <BookFormProvider form={form}>
            <form>
                <BookFormFields />

                <Button type="submit">Submit</Button>
            </form>
        </BookFormProvider>
    );
}
