"use client";

import { RatingSelectType } from "@/zod-schemas/story";

import { Rating, RatingProps } from "@mantine/core";
import { createFormContext } from "@mantine/form";

export const [RatingFormProvider, useRatingFormContext, useRatingForm] =
    createFormContext<RatingSelectType>();

type RatingFieldsProps = Partial<RatingProps>;

export function RatingFields({ ...props }: RatingFieldsProps) {
    const form = useRatingFormContext();

    return (
        <Rating
            key={form.key("stars")}
            {...form.getInputProps("stars")}
            {...props}
        />
    );
}
