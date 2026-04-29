"use client";

import {
    useFavouriteStatus,
    useFavouriteStory,
} from "@/lib/hooks/favourite/favourite-story-hook";
import classes from "@/styles/story/favourite-story.module.css";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import clsx from "clsx";
import { useRef, useState } from "react";

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
    const [playAnimation, setPlayAnimation] = useState(false);

    // This prevents the action from flipping incorrectly during rapid clicks.
    const serverStateRef = useRef(false);

    function postProcessInitialFetch(favStatus: boolean) {
        setIsFavourited(favStatus);
        serverStateRef.current = favStatus;
    }

    const { isLoading: isInitializing } = useFavouriteStatus({
        userId,
        storyId,
        postProcessInitialFetch,
    });

    const { executeAsync: insertFav, isPending: isInserting } =
        useFavouriteStory("insert");
    const { executeAsync: deleteFav, isPending: isDeleting } =
        useFavouriteStory("delete");

    const isPending = isInserting || isDeleting;

    const debouncedSync = useDebouncedCallback(async (targetState: boolean) => {
        // If the user clicked an even number of times and returned to
        // the original state, do nothing.
        if (targetState === serverStateRef.current) return;

        try {
            // Perform the action required to reach the targetState
            const result = targetState
                ? await insertFav({ userId: userId!, storyId })
                : await deleteFav({ userId: userId!, storyId });

            if (result.data) {
                serverStateRef.current = targetState;
            }
        } catch (error) {
            // Rollback to last known server state on failure
            setIsFavourited(serverStateRef.current);
        }
    }, 800);

    const handleToggle = () => {
        if (!userId) {
            openAuthModal();
            return;
        }

        const nextState = !isFavourited;

        // 1. Instant Visual Update
        setIsFavourited(nextState);

        // 2. Animation Logic
        if (nextState) {
            setPlayAnimation(true);
            setTimeout(() => setPlayAnimation(false), 450);
        }

        // 3. Debounced Sync
        debouncedSync(nextState);
    };

    const Icon = isFavourited ? IconHeartFilled : IconHeart;
    const label = isFavourited ? "Remove from favourites" : "Add to favourites";

    return (
        <Tooltip
            label={label}
            withArrow
            position="top"
            disabled={isInitializing}
        >
            <ActionIcon
                variant="transparent"
                color="red.9"
                size="lg"
                radius="xl"
                onClick={handleToggle}
                disabled={isInitializing}
                className={clsx(classes.root, { [classes.pending]: isPending })}
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
