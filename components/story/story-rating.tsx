"use client";

import { ActionIcon, Group, Rating, TooltipFloating } from "@mantine/core";

import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { calculateRatingsAverage } from "@/lib/utils/story/story-utils";
import publicStyles from "@/styles/public.module.css";
import { useDisclosure, useMounted } from "@mantine/hooks";
import { IconStar, IconStarOff } from "@tabler/icons-react";
import cx from "clsx";
import { AuthenticationDrawer } from "../auth/auth-drawer";
import { RatingForm } from "../forms/rating/rating-form";
import { StoryRatingProps } from "@/types/story";

export function StoryRating({
    ratings,
    isbn: storyISBN,
    userRating,
}: StoryRatingProps) {
    const [opened, { close, toggle }] = useDisclosure(false);

    const rating = calculateRatingsAverage(ratings);

    const { sessionUser } = useCentralizedAuth();

    const mounted = useMounted();

    const [openedAuthModal, { open: openAuthModal, close: closeAuthModal }] =
        useDisclosure(false);

    return (
        <Group align="center" justify="space-between" gap={"xs"}>
            {mounted && !sessionUser.isPending && (
                <>
                    <ActionIcon.Group>
                        <ActionIcon
                            size={"sm"}
                            onClick={() => {
                                if (!sessionUser.data?.user.id) {
                                    openAuthModal();
                                } else {
                                    toggle();
                                }
                            }}
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
                            onClick={() => {
                                if (!sessionUser.data?.user.id) {
                                    openAuthModal();
                                } else {
                                    toggle();
                                }
                            }}
                            className={cx(
                                publicStyles.boldText,
                                publicStyles.cursorPointer
                            )}
                        >
                            {!opened ? "Rate This Story" : "Close Rating"}
                        </ActionIcon.GroupSection>
                        <ActionIcon
                            size={"sm"}
                            onClick={() => {
                                if (!sessionUser.data?.user.id) {
                                    openAuthModal();
                                } else {
                                    toggle();
                                }
                            }}
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

                    {sessionUser.data?.user.id && (
                        <RatingForm
                            userRating={userRating}
                            storyISBN={storyISBN}
                            userId={sessionUser.data.user.id}
                            closeRatingForm={close}
                            position={{ bottom: 20, right: 20 }}
                            className={cx(!opened && publicStyles.hide)}
                        />
                    )}

                    <AuthenticationDrawer
                        opened={openedAuthModal}
                        close={closeAuthModal}
                    />
                </>
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
