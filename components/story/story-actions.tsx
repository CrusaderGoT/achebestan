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

import { useCentralizedAuth } from "@/lib/auth/centralized-auth-context-provider";
import { canCreateComment } from "@/lib/auth/policies";
import { PickedStoryProps, StoryPermissionsType } from "@/types/story";
import { useDisclosure, useIsomorphicEffect, useMounted } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { AuthenticationDrawer } from "../auth/auth-drawer";
import { CreateCommentForm } from "../forms/comment/create-comment-form";
import { PushNotificationToggle } from "../pwa/push-notification-toggle";
import { DeleteStory } from "./buttons/delete-story";
import { FavouriteStory } from "./buttons/favourite-story";
import { ShareStoryDrawer } from "./buttons/share-story-drawer";

export function StoryActions({
    permissions,
    ...props
}: PickedStoryProps & { permissions?: StoryPermissionsType }) {
    const { sessionUser } = useCentralizedAuth();

    const [openedStoryShare, { open: openStoryShare, close: closeStoryShare }] =
        useDisclosure(false);

    const [openedAuthModal, { open: openAuthModal, close: closeAuthModal }] =
        useDisclosure(false);

    const [canComment, setCanComment] = useState(false);

    useEffect(() => {
        async function checkCanComment() {
            if (!sessionUser.data?.user.id) {
                return false;
            }

            const can = await canCreateComment();

            return can;
        }
        checkCanComment().then(setCanComment);
    }, [sessionUser.data?.user.id]);

    const [
        openedCommentForm,
        { toggle: toggleCommentForm, open: openCommentForm },
    ] = useDisclosure(false);

    useIsomorphicEffect(() => {
        if (!!sessionUser.data?.user && canComment) {
            openCommentForm();
        }
    }, [sessionUser.data?.user, canComment]);

    const mounted = useMounted();

    if (!mounted) return null;

    return (
        <>
            <Stack>
                <Group justify="space-between" grow>
                    {!sessionUser.isPending && (
                        <FavouriteStory
                            userId={sessionUser.data?.user.id}
                            storyId={props.id}
                            openAuthModal={openAuthModal}
                        />
                    )}

                    {!sessionUser.isPending && canComment && (
                        <ActionIcon
                            onClick={() => {
                                if (!sessionUser.data?.user.id) {
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

                    {!sessionUser.isPending && permissions?.canDeleteStory && (
                        <DeleteStory {...props} />
                    )}
                </Group>

                <Transition
                    mounted={openedCommentForm && canComment}
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
                                />
                            </Box>
                        </>
                    )}
                </Transition>
            </Stack>

            <PushNotificationToggle userExists={!!sessionUser.data?.user} />

            <AuthenticationDrawer
                opened={openedAuthModal}
                close={closeAuthModal}
            />
        </>
    );
}
