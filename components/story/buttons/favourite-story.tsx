"use client";

import { getfavouriteUserStory } from "@/lib/actions/favourite";
import { useFavouriteStory } from "@/lib/hooks/favourite/favourite-story-hook";
import classes from "@/styles/story/favourite-story.module.css";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import clsx from "clsx";
import { useEffect, useState } from "react";

interface FavouriteStoryProps {
    userId: string | undefined;
    storyId: number;
    openAuthModal: () => void;
}

export function FavouriteStory({
    userId,
    storyId,
    openAuthModal,
}: FavouriteStoryProps) {
    const [isFavourited, setIsFavourited] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [playAnimation, setPlayAnimation] = useState(false);

    useEffect(() => {
        if (!userId) {
            setIsInitializing(false);
            return;
        }
        const fetchStatus = async () => {
            try {
                const curFav = await getfavouriteUserStory(userId, storyId);
                setIsFavourited(!!curFav);
            } finally {
                setIsInitializing(false);
            }
        };
        fetchStatus();
    }, [userId, storyId]);

    const action = isFavourited ? "delete" : "insert";
    const { executeAsync, isPending } = useFavouriteStory(action);

    const handleToggle = useDebouncedCallback(async () => {
        if (!userId) {
            openAuthModal();
            return;
        }

        // Optimistic Update: Change UI immediately
        const previousState = isFavourited;
        setIsFavourited(!previousState);

        // Trigger animation logic
        if (!previousState) {
            setPlayAnimation(true);
            setTimeout(() => setPlayAnimation(false), 450); // Reset after animation duration
        }

        // Background Request
        try {
            const result = await executeAsync({ userId, storyId });
            // Sync state with actual server result if necessary
            if (result.data?.created) setIsFavourited(true);
            if (result.data?.deleted) setIsFavourited(false);
        } catch (error) {
            // 4. Rollback on error
            setIsFavourited(previousState);
        }
    }, 1000);

    const Icon = isFavourited ? IconHeartFilled : IconHeart;
    const label = isFavourited ? "Remove from favourites" : "Add to favourites";

    return (
        <Tooltip
            label={label}
            withArrow
            position="top"
            disabled={isInitializing || isPending}
        >
            <ActionIcon
                variant="transparent"
                color="red.9"
                size="lg"
                radius="xl"
                onClick={handleToggle}
                className={clsx(classes.root, {
                    [classes.pending]: isPending,
                })}
                aria-label={label}
            >
                <Icon
                    className={clsx(classes.icon, {
                        [classes.animate]: playAnimation,
                    })}
                    size={24}
                    stroke={1.5}
                />
            </ActionIcon>
        </Tooltip>
    );
}
