"use client";

import { RatingSelectType, UserRatingWithComment } from "@/zod-schemas/rating";
import {
    ActionIcon,
    Group,
    Rating,
    Text,
    TooltipFloating,
} from "@mantine/core";

import { authClient } from "@/lib/auth-client";
import { calculateRatingsAverage } from "@/lib/utils/helpers";
import publicStyles from "@/styles/public.module.css";
import { useDisclosure, useMounted } from "@mantine/hooks";
import { IconStar, IconStarOff } from "@tabler/icons-react";
import cx from "clsx";
import { RatingForm } from "../forms/rating/rating-form";

type StoryRatingProps = {
    ratings: RatingSelectType[];
    storyISBN: string;
    userRating?: UserRatingWithComment;
};

export function StoryRating({
    ratings,
    storyISBN,
    userRating,
}: StoryRatingProps) {
    const [opened, { close, toggle }] = useDisclosure(false);

    const rating = calculateRatingsAverage(ratings);

    const { data: session } = authClient.useSession();

    const mounted = useMounted();

    return (
        <Group align="center" justify="space-between" gap={"xs"}>
            {session?.user.id && mounted ? (
                <>
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
                        userId={session.user.id}
                        closeRatingForm={close}
                        position={{ bottom: 20, right: 20 }}
                        className={cx(!opened && publicStyles.hide)}
                    />
                </>
            ) : (
                <Text>log in to rate</Text>
            )}

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
}
