"use client";

import { ActionIcon, Box, Group, Stack, Text, Transition } from "@mantine/core";

import {
    IconCurrencyDollar,
    IconMessage2,
    IconMessage2Off,
} from "@tabler/icons-react";

import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { PickedStoryProps, StoryPermissionsType } from "@/types/story";
import { CommentSelectType } from "@/zod-schemas/comment";
import {
    useDisclosure,
    UseDisclosureReturnValue,
    useIsomorphicEffect,
    useMounted,
} from "@mantine/hooks";
import { AuthenticationDrawer } from "../auth/auth-drawer";
import { CreateCommentForm } from "../forms/comment/create-comment-form";
import { PushNotificationToggle } from "../pwa/push-notification-toggle";
import { DeleteStory } from "./buttons/delete-story";
import { FavouriteStory } from "./buttons/favourite-story";
import { ShareStoryDrawer } from "./buttons/share-story-drawer";

export function StoryActions({
    permissions,
    ...props
}: PickedStoryProps & {
    permissions?: StoryPermissionsType;
    commentBoxDisclosure: UseDisclosureReturnValue;
}) {
    const { sessionUser } = useCentralizedAuth();

    const [openedStoryShare, { open: openStoryShare, close: closeStoryShare }] =
        useDisclosure(false);

    const [openedAuthModal, { open: openAuthModal, close: closeAuthModal }] =
        useDisclosure(false);

    useIsomorphicEffect(() => {
        if (!!sessionUser.data?.user && permissions?.canComment) {
            props.commentBoxDisclosure[1].open();
        }
    }, [sessionUser.data?.user, permissions?.canComment]);

    const mounted = useMounted();

    if (!mounted) return null;

    return (
        <>
            <Stack>
                <PushNotificationToggle userExists={!!sessionUser.data?.user} />

                <Group justify="space-evenly">
                    {!sessionUser.isPending && (
                        <FavouriteStory
                            userId={sessionUser.data?.user.id}
                            storyId={props.id}
                            openAuthModal={openAuthModal}
                        />
                    )}

                    {!sessionUser.isPending && permissions?.canComment && (
                        <ActionIcon
                            onClick={() => {
                                if (!sessionUser.data?.user.id) {
                                    openAuthModal();
                                } else {
                                    props.commentBoxDisclosure[1].toggle();
                                }
                            }}
                            color="gray"
                            variant="subtle"
                        >
                            <Group gap={"xs"} wrap="nowrap">
                                <Text visibleFrom="sm" fw={500}>
                                    {props.commentBoxDisclosure[0]
                                        ? "Close"
                                        : "Comment"}
                                </Text>

                                {props.commentBoxDisclosure[0] ? (
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

                    {!sessionUser.isPending && permissions?.canDelete && (
                        <DeleteStory {...props} />
                    )}
                </Group>
            </Stack>

            <AuthenticationDrawer
                opened={openedAuthModal}
                close={closeAuthModal}
            />
        </>
    );
}

export type NewCommentBoxProps = {
    commentBoxDisclosure: UseDisclosureReturnValue;
    canComment: boolean | undefined;
    storyISBN: string;
};

export function NewCommentBox({
    commentBoxDisclosure,
    canComment,
    storyISBN,
    onNewComment,
}: NewCommentBoxProps & {
    onNewComment: (newComment: CommentSelectType) => Promise<void>;
}) {
    return (
        <Transition
            mounted={commentBoxDisclosure[0] && !!canComment}
            transition="scale-y"
            duration={400}
            timingFunction="ease-in-out"
            keepMounted
        >
            {(styles) => (
                <Box style={styles}>
                    <CreateCommentForm
                        onNewCommentAdded={onNewComment}
                        storyISBN={storyISBN}
                        text=""
                    />
                </Box>
            )}
        </Transition>
    );
}
