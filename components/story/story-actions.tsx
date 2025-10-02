"use client";

import {
    ActionIcon,
    Box,
    Divider,
    Group,
    Stack,
    Text,
    Transition,
} from "@mantine/core";

import {
    IconCurrencyDollar,
    IconMessage2,
    IconMessage2Off,
} from "@tabler/icons-react";

import { authClient } from "@/lib/auth-client";
import { PickedStoryProps } from "@/types/story";
import { useDisclosure, useInViewport, useMounted } from "@mantine/hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import { CreateCommentForm } from "../forms/comment/create-comment-form";
import { PushNotificationToggle } from "../pwa/push-notification-toggle";
import { DeleteStory } from "./buttons/delete-story";
import { FavouriteStory } from "./buttons/favourite-story";
import { ShareStoryDrawer } from "./buttons/share-story-drawer";

export function StoryActions({ ...props }: PickedStoryProps) {
    const [openedStoryShare, { open: openStoryShare, close: closeStoryShare }] =
        useDisclosure(false);

    const [
        openedCommentForm,
        { toggle: toggleCommentForm, close: closeCommentForm },
    ] = useDisclosure(true);

    const mounted = useMounted();

    const { data: session } = authClient.useSession();

    const [openedPND, setOpenedPND] = useState(false);

    const { ref, inViewport } = useInViewport();

    const closedPNDRef = useRef(false);

    useEffect(() => {
        if (inViewport && closedPNDRef.current !== true) {
            setOpenedPND(true);
        } else if (!inViewport) {
            setOpenedPND(false);
        }
    }, [inViewport, closedPNDRef]);

    const handleClosePND = useCallback(() => {
        setOpenedPND(false);
        closedPNDRef.current = true;
    }, [closedPNDRef, setOpenedPND]);

    if (!mounted) return null;

    return (
        <>
            <Stack ref={ref}>
                <Group justify="space-between" grow>
                    <FavouriteStory
                        userId={session?.user.id}
                        storyId={props.id}
                    />

                    <ActionIcon
                        onClick={toggleCommentForm}
                        color="gray"
                        variant="subtle"
                    >
                        <Group gap={"xs"} wrap="nowrap">
                            <Text visibleFrom="sm" fw={500}>
                                {openedCommentForm ? "Close" : "Comment"}
                            </Text>

                            {openedCommentForm ? (
                                <IconMessage2Off />
                            ) : (
                                <IconMessage2 />
                            )}
                        </Group>
                    </ActionIcon>

                    <IconCurrencyDollar color="green" />

                    <ShareStoryDrawer
                        story={{ ...props }}
                        openedStoryShare={openedStoryShare}
                        openStoryShare={openStoryShare}
                        closeStoryShare={closeStoryShare}
                    />

                    <DeleteStory {...props} />
                </Group>

                <Transition
                    mounted={openedCommentForm && !!session?.user.id}
                    transition="scale-y"
                    duration={400}
                    timingFunction="ease-in-out"
                >
                    {(styles) => (
                        <>
                            <Divider />

                            <Box style={styles}>
                                <CreateCommentForm
                                    storyISBN={props.isbn}
                                    text=""
                                    closeCommentForm={closeCommentForm}
                                />
                            </Box>
                        </>
                    )}
                </Transition>
            </Stack>

            <PushNotificationToggle
                opened={openedPND}
                onClose={handleClosePND}
                withCloseButton
                shadow="sm"
                userExists={!!session?.user}
            />
        </>
    );
}
