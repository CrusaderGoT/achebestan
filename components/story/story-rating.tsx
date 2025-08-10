"use client";

import { RatingSelectType } from "@/zod-schemas/story";
import { ActionIcon, Box, Group, Rating, TooltipFloating } from "@mantine/core";
import { useState } from "react";

import publicStyles from "@/styles/public.module.css";
import { useDisclosure } from "@mantine/hooks";
import { IconStar, IconStarOff } from "@tabler/icons-react";
import cx from "clsx";
import { RatingForm } from "../forms/story/rating-form";

type StoryRatingProps = {
    ratings: RatingSelectType[];
    storyId: number;
    userRating?: RatingSelectType;
};

export function StoryRating({
    ratings,
    storyId,
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
                    storyId={storyId}
                    setRating={setRating}
                    ratings={ratings}
                    closeRatingForm={close}
                />
            </Box>

            {ratings.length > 0 && (
                <TooltipFloating label={`${rating.toFixed(1)} stars`}>
                    <Rating
                        defaultValue={rating}
                        fractions={2}
                        readOnly
                        className={cx(opened && publicStyles.hide)}
                    />
                </TooltipFloating>
            )}
        </Group>
    );
}

export function calculateRatingsAverage(ratings: RatingSelectType[]) {
    if (ratings.length < 1) return 0;

    const avg = ratings.reduce((acc, cur) => {
        acc.stars += cur.stars;
        return acc;
    });

    avg.stars /= ratings.length;
    return avg.stars;
}
