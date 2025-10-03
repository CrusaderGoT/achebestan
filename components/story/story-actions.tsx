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
import { useDisclosure, useIsomorphicEffect, useMounted } from "@mantine/hooks";
import { CreateCommentForm } from "../forms/comment/create-comment-form";
import { AuthenticationModal } from "../forms/user/auth-modal";
import { PushNotificationToggle } from "../pwa/push-notification-toggle";
import { DeleteStory } from "./buttons/delete-story";
import { FavouriteStory } from "./buttons/favourite-story";
import { ShareStoryDrawer } from "./buttons/share-story-drawer";

export function StoryActions({ ...props }: PickedStoryProps) {
    const [openedStoryShare, { open: openStoryShare, close: closeStoryShare }] =
        useDisclosure(false);

    const mounted = useMounted();

    const { data: session, isPending: isPendingSession } =
        authClient.useSession();

    const [
        openedCommentForm,
        {
            toggle: toggleCommentForm,
            close: closeCommentForm,
            open: openCommentForm,
        },
    ] = useDisclosure(false);

    const [openedAuthModal, { open: openAuthModal, close: closeAuthModal }] =
        useDisclosure(false);

    useIsomorphicEffect(() => {
        if (!!session?.user.id) {
            openCommentForm();
        }
    }, [session?.user.id]);

    if (!mounted) return null;

    return (
        <>
            <Stack>
                <Group justify="space-between" grow>
                    {!isPendingSession && (
                        <FavouriteStory
                            userId={session?.user.id}
                            storyId={props.id}
                            openAuthModal={openAuthModal}
                        />
                    )}

                    {!isPendingSession && (
                        <ActionIcon
                            onClick={() => {
                                if (!session?.user.id) {
                                    openAuthModal();
                                } else {
                                    toggleCommentForm();
                                }
                            }}
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
                    )}

                    <IconCurrencyDollar color="green" />

                    <ShareStoryDrawer
                        story={{ ...props }}
                        openedStoryShare={openedStoryShare}
                        openStoryShare={openStoryShare}
                        closeStoryShare={closeStoryShare}
                    />

                    {!isPendingSession && <DeleteStory {...props} />}
                </Group>

                <Transition
                    mounted={openedCommentForm}
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

            <PushNotificationToggle userExists={!!session?.user} />

            <AuthenticationModal
                opened={openedAuthModal}
                close={closeAuthModal}
            />
        </>
    );
}
