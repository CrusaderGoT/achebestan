"use client";

import {
    InsertRatingFormProvider,
    RatingFields,
    useInsertRatingForm,
} from "@/components/forms/story/rating-form-context";
import { calculateRatingsAverage } from "@/components/story/story-rating";
import { useRateStory } from "@/lib/hooks/rate-story-hook";
import {
    ratingInsertSchema,
    RatingInsertType,
    RatingSelectType,
} from "@/zod-schemas/story";
import { ActionIcon, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { Dispatch, SetStateAction } from "react";

type RatingFormProps = {
    userRating?: RatingSelectType;
    storyId: number;
    setRating: Dispatch<SetStateAction<number>>;
    closeRatingForm: () => void;
    ratings: RatingSelectType[];
};

export function RatingForm({
    userRating,
    storyId,
    setRating,
    ratings,
    closeRatingForm,
}: RatingFormProps) {
    const form = useInsertRatingForm({
        initialValues: {
            storyId: storyId,
            stars: userRating?.stars || 0,
        },
        mode: "uncontrolled",
        validate: zod4Resolver(ratingInsertSchema),
    });

    const { executeAsync } = useRateStory();

    async function handleSubmit(data: RatingInsertType) {
        const { data: rated } = await executeAsync({
            stars: data.stars,
            storyId: data.storyId,
        });

        if (rated) {
            ratings.push(rated);
            setRating(calculateRatingsAverage(ratings));
            closeRatingForm();
        } else {
            notifications.show({
                message: "Your Rating Failed",
            });
        }
    }

    return (
        <InsertRatingFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Group>
                    <RatingFields fractions={2} />
                    <ActionIcon
                        size={"xs"}
                        color="green"
                        type="submit"
                        loading={form.submitting}
                    >
                        <IconCheck />
                    </ActionIcon>
                </Group>
            </form>
        </InsertRatingFormProvider>
    );
}
