"use client";

import { RatingSelectType } from "@/zod-schemas/story";
import { ActionIcon, Box, Group, Rating, TooltipFloating } from "@mantine/core";
import { useState } from "react";

import publicStyles from "@/styles/public.module.css";
import { useDisclosure } from "@mantine/hooks";
import { IconStar, IconStarOff } from "@tabler/icons-react";
import cx from "clsx";
import { RatingForm } from "../forms/rating/rating-form";

type StoryRatingProps = {
    ratings: RatingSelectType[];
    storyISBN: string;
    userRating?: RatingSelectType;
};

export function StoryRating({
    ratings,
    storyISBN,
    userRating,
}: StoryRatingProps) {
    const [opened, { close, toggle }] = useDisclosure(false);

    const [rating, setRating] = useState<number>(
        calculateRatingsAverage(ratings)
    );

    return (
        <Group align="center" justify="space-between" gap={"xs"}>
            <ActionIcon.Group>
                <ActionIcon
                    size={"sm"}
                    onClick={() => toggle()}
                    variant="outline"
                    color={opened ? "red" : "green"}
                >
                    {opened ? (
                        <IconStarOff size={16} />
                    ) : (
                        <IconStar size={16} />
                    )}
                </ActionIcon>
                <ActionIcon.GroupSection
                    size={"sm"}
                    variant="outline"
                    color={opened ? "red" : "green"}
                    onClick={() => toggle()}
                    className={cx(
                        publicStyles.boldText,
                        publicStyles.cursorPointer
                    )}
                >
                    {!opened ? "Rate This Story" : "Close Rating"}
                </ActionIcon.GroupSection>
                <ActionIcon
                    size={"sm"}
                    onClick={() => toggle()}
                    variant="outline"
                    color={opened ? "red" : "green"}
                >
                    {opened ? (
                        <IconStarOff size={16} />
                    ) : (
                        <IconStar size={16} />
                    )}
                </ActionIcon>
            </ActionIcon.Group>

            <Box className={cx(!opened && publicStyles.hide)}>
                <RatingForm
                    userRating={userRating}
                    storyISBN={storyISBN}
                    setRating={setRating}
                    ratings={ratings}
                    closeRatingForm={close}
                />
            </Box>

            {ratings.length > 0 && (
                <TooltipFloating label={`${rating.toFixed(1)} stars`}>
                    <Rating
                        value={rating}
                        fractions={2}
                        readOnly
                        className={cx(opened && publicStyles.hide)}
                    />
                </TooltipFloating>
            )}
        </Group>
    );
}

export function calculateRatingsAverage(
    ratings: RatingSelectType[],
    updateUserRating?: RatingSelectType
) {
    if (ratings.length < 1 && !updateUserRating) return 0;

    // Create a copy of ratings to work with
    const workingRatings = [...ratings];

    // Handle user rating update/addition
    if (updateUserRating?.userId) {
        const existingIndex = workingRatings.findIndex(
            (r) => r.userId === updateUserRating.userId
        );

        if (existingIndex >= 0) {
            // Update existing rating
            workingRatings[existingIndex] = updateUserRating;
        } else {
            // Add new rating
            workingRatings.push(updateUserRating);
        }
    }

    // Remove duplicates by keeping the latest rating per user
    const uniqueRatings = new Map<string, RatingSelectType>();

    workingRatings.forEach((rating) => {
        if (rating.userId) {
            uniqueRatings.set(rating.userId, rating);
        }
    });

    const uniqueRatingsArray = Array.from(uniqueRatings.values());

    if (uniqueRatingsArray.length === 0) return 0;

    // Calculate average from unique ratings
    const totalStars = uniqueRatingsArray.reduce(
        (sum, rating) => sum + rating.stars,
        0
    );
    return totalStars / uniqueRatingsArray.length;
}
