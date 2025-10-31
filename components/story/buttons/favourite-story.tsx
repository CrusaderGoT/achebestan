

import { getfavouriteUserStory } from "@/lib/actions/favourite";
import { useFavouriteStory } from "@/lib/hooks/favourite/favourite-story-hook";
import { ActionIcon, Group, Text } from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

export function FavouriteStory({
    userId,
    storyId,
    openAuthModal,
}: {
    userId: string | undefined;
    storyId: number;
    openAuthModal: () => void;
}) {
    const [isFavourited, setIsFavourited] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    // Fetch initial favourite status
    useEffect(() => {
        if (!userId) {
            setIsInitializing(false);
            return;
        }

        setIsInitializing(true);

        const fetchFavouriteStatus = async () => {
            const curFav = await getfavouriteUserStory(userId, storyId);
            setIsFavourited(!!curFav);
            setIsInitializing(false);
        };

        fetchFavouriteStatus();
    }, [userId, storyId]);

    // Determine the action based on current state
    const action = isFavourited ? "delete" : "insert";
    const { executeAsync, isPending } = useFavouriteStory(action);

    const handleToggleFavourite = useCallback(async () => {
        if (!userId) {
            // TODO: Open auth modal or redirect to login
            console.log("User not authenticated - open auth modal");
            return;
        } else {
            const result = await executeAsync({
                userId: userId,
                storyId: storyId,
            });
            // Update local state based on the result
            if (result.data?.created) {
                setIsFavourited(true);
            } else if (result.data?.deleted) {
                setIsFavourited(false);
            }
        }
    }, [userId, storyId, executeAsync]);

    return (
        <ActionIcon
            onClick={() => {
                if (!userId) {
                    openAuthModal();
                } else {
                    handleToggleFavourite();
                }
            }}
            variant="subtle"
            color="red"
            loading={isPending}
            disabled={isInitializing}
        >
            <Group gap="xs">
                <Text visibleFrom="sm" fw={500}>
                    Favourite
                </Text>
                {isFavourited && userId ? (
                    <IconHeartFilled color="red" />
                ) : (
                    <IconHeart color="red" />
                )}
            </Group>
        </ActionIcon>
    );
}
