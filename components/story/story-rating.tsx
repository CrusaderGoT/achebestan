"use client";

import { RatingSelectType, UserRatingWithComment } from "@/zod-schemas/story";
import { ActionIcon, Group, Rating, TooltipFloating } from "@mantine/core";
import { useState } from "react";

import { calculateRatingsAverage } from "@/lib/utils/calculate-ratings-average";
import publicStyles from "@/styles/public.module.css";
import { useDisclosure } from "@mantine/hooks";
import { IconStar, IconStarOff } from "@tabler/icons-react";
import cx from "clsx";
import { RatingForm } from "../forms/rating/rating-form";

type StoryRatingProps = {
    ratings: RatingSelectType[];
    storyISBN: string;
    userId?: string;
    userRating?: UserRatingWithComment;
};

export function StoryRating({
    ratings,
    storyISBN,
    userRating,
    userId,
}: StoryRatingProps) {
    const [opened, { close, toggle }] = useDisclosure(false);

    const [rating, setRating] = useState<number>(
        calculateRatingsAverage(ratings)
    );

    if (userId) {
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

                <RatingForm
                    userRating={userRating}
                    storyISBN={storyISBN}
                    userId={userId}
                    setRating={setRating}
                    ratings={ratings}
                    closeRatingForm={close}
                    position={{ bottom: 20, right: 20 }}
                    className={cx(!opened && publicStyles.hide)}
                />

                {ratings.length > 0 && (
                    <>
                        <TooltipFloating label={`${rating.toFixed(1)} stars`}>
                            <Rating
                                value={rating}
                                fractions={2}
                                readOnly
                                className={cx(opened && publicStyles.hide)}
                            />
                        </TooltipFloating>
                    </>
                )}
            </Group>
        );
    } else {
        {
            /**login or signup form */
        }
        return null;
    }
}
