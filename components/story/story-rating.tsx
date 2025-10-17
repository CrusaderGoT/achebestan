"use client";

import { RatingSelectType, UserRatingWithComment } from "@/zod-schemas/rating";
import { ActionIcon, Group, Rating, TooltipFloating } from "@mantine/core";

import { authClient } from "@/lib/auth-client";
import { calculateRatingsAverage } from "@/lib/utils/story/story-utils";
import publicStyles from "@/styles/public.module.css";
import { useDisclosure, useMounted } from "@mantine/hooks";
import { IconStar, IconStarOff } from "@tabler/icons-react";
import cx from "clsx";
import { RatingForm } from "../forms/rating/rating-form";
import { AuthenticationModal } from "../auth/auth-modal";

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

    const { data: session, isPending } = authClient.useSession();

    const mounted = useMounted();

    const [openedAuthModal, { open: openAuthModal, close: closeAuthModal }] =
        useDisclosure(false);

    return (
        <Group align="center" justify="space-between" gap={"xs"}>
            {mounted && !isPending && (
                <>
                    <ActionIcon.Group>
                        <ActionIcon
                            size={"sm"}
                            onClick={() => {
                                if (!session?.user.id) {
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
                                if (!session?.user.id) {
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
                                if (!session?.user.id) {
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

                    {session?.user.id && (
                        <RatingForm
                            userRating={userRating}
                            storyISBN={storyISBN}
                            userId={session.user.id}
                            closeRatingForm={close}
                            position={{ bottom: 20, right: 20 }}
                            className={cx(!opened && publicStyles.hide)}
                        />
                    )}

                    <AuthenticationModal
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
