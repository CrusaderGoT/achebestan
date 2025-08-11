"use client";

import {
    RatingFields,
    RatingFormProvider,
    useRatingForm,
} from "@/components/forms/rating/rating-form-context";
import { calculateRatingsAverage } from "@/components/story/story-rating";
import { useDeleteRating } from "@/lib/hooks/delete-rating-hook";
import { useRateStory } from "@/lib/hooks/rate-story-hook";
import { ratingSelectSchema, RatingSelectType } from "@/zod-schemas/story";
import { ActionIcon, Group } from "@mantine/core";
import { IconCheck, IconTrashFilled } from "@tabler/icons-react";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { Dispatch, SetStateAction, useState } from "react";

type RatingFormProps = {
    storyISBN: string;
    setRating: Dispatch<SetStateAction<number>>;
    closeRatingForm: () => void;
    ratings: RatingSelectType[];
    userRating?: RatingSelectType;
};

export function RatingForm({
    setRating,
    ratings,
    closeRatingForm,
    userRating,
    storyISBN,
}: RatingFormProps) {
    const [userRatingState, setUserRatingState] = useState<
        RatingSelectType | undefined
    >(userRating);

    const form = useRatingForm({
        initialValues: {
            storyISBN: storyISBN,
            stars: userRatingState?.stars || 0,
            id: userRatingState?.id || "new",
        },
        mode: "uncontrolled",
        validate: zod4Resolver(ratingSelectSchema),
    });

    const { executeAsync: executeAsyncRateStory } = useRateStory();

    const {
        executeAsync: executeAsyncDeleteRating,
        isPending: isPendingDeleteRating,
    } = useDeleteRating();

    async function handleSubmit(data: RatingSelectType) {
        const { data: rated } = await executeAsyncRateStory({
            stars: data.stars,
            storyISBN: data.storyISBN,
            id: userRatingState?.id || "new",
        });

        if (rated) {
            setUserRatingState(rated);

            // Instead of pushing, update the ratings array properly
            const existingIndex = ratings.findIndex(
                (r) => r.userId === rated.userId
            );

            if (existingIndex >= 0) {
                // Update existing rating in place
                ratings[existingIndex] = rated;
            } else {
                // Add new rating
                ratings.push(rated);
            }

            // Calculate new average (don't pass rated again since it's already in ratings)
            setRating(calculateRatingsAverage(ratings));
            closeRatingForm();
        }
    }

    return (
        <RatingFormProvider form={form}>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Group>
                    <RatingFields fractions={2} />
                    <ActionIcon
                        size={"xs"}
                        color="green"
                        type="submit"
                        title="submit your rating"
                        variant="light"
                        loading={form.submitting || isPendingDeleteRating}
                    >
                        <IconCheck />
                    </ActionIcon>
                    {userRatingState?.id &&
                        typeof userRatingState.id === "number" && (
                            <ActionIcon
                                size={"xs"}
                                color="red"
                                title="delete your rating"
                                variant="light"
                                loading={
                                    form.submitting || isPendingDeleteRating
                                }
                                onClick={async () => {
                                    const deletedRate =
                                        await executeAsyncDeleteRating({
                                            storyISBN: storyISBN,
                                        });

                                    if (deletedRate) {
                                        setUserRatingState({
                                            id: "new",
                                            stars: 0,
                                            storyISBN: storyISBN,
                                        });
                                        closeRatingForm();
                                    }
                                }}
                            >
                                <IconTrashFilled />
                            </ActionIcon>
                        )}
                </Group>
            </form>
        </RatingFormProvider>
    );
}
