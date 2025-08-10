"use client";

import { RatingInsertType } from "@/zod-schemas/story";

import { Rating, RatingProps } from "@mantine/core";
import { createFormContext } from "@mantine/form";

export const [
    InsertRatingFormProvider,
    useInsertRatingFormContext,
    useInsertRatingForm,
] = createFormContext<RatingInsertType>();

type RatingFieldsProps = Partial<RatingProps>;

export function RatingFields({ ...props }: RatingFieldsProps) {
    const form = useInsertRatingFormContext();

    return (
        <Rating
            key={form.key("stars")}
            {...form.getInputProps("stars")}
            {...props}
        />
    );
}
