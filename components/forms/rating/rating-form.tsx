"use client";

import {
    RatingFields,
    RatingFormProvider,
    useRatingForm,
} from "@/components/forms/rating/rating-form-context";
import { useDeleteRating } from "@/lib/hooks/delete-rating-hook";
import { useRateStory } from "@/lib/hooks/rate-story-hook";
import { calculateRatingsAverage } from "@/lib/utils/calculate-ratings-average";
import ratingStyles from "@/styles/rating.module.css";
import { ratingSelectSchema, RatingSelectType } from "@/zod-schemas/story";
import { ActionIcon, Affix, AffixProps, Group, Stack } from "@mantine/core";
import { IconCheck, IconTrashFilled } from "@tabler/icons-react";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { Dispatch, SetStateAction, useState } from "react";

type RatingFormProps = {
    storyISBN: string;
    setRating: Dispatch<SetStateAction<number>>;
    closeRatingForm: () => void;
    ratings: RatingSelectType[];
    userRating?: RatingSelectType;
} & Partial<AffixProps>;

export function RatingForm({
    setRating,
    ratings,
    closeRatingForm,
    userRating,
    storyISBN,
    ...props
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
        // check if values changed
        if (form.isDirty()) {
            const { data: rated } = await executeAsyncRateStory({
                id: userRatingState?.id || "new",
                stars: data.stars,
                storyISBN: data.storyISBN,
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
            }

            closeRatingForm();
        }
    }

    return (
        <Affix {...props}>
            <RatingFormProvider form={form}>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack className={ratingStyles.ratingStack}>
                        <Group justify="space-between">
                            <RatingFields fractions={2} />
                            <Group>
                                <ActionIcon
                                    size={"xs"}
                                    color="green"
                                    type="submit"
                                    title="submit your rating"
                                    variant="light"
                                    loading={form.submitting}
                                    disabled={isPendingDeleteRating}
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
                                            loading={isPendingDeleteRating}
                                            disabled={form.submitting}
                                            onClick={async () => {
                                                const deletedRate =
                                                    await executeAsyncDeleteRating(
                                                        {
                                                            storyISBN:
                                                                storyISBN,
                                                        }
                                                    );

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
                        </Group>
                    </Stack>
                </form>
            </RatingFormProvider>
        </Affix>
    );
}
