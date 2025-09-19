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
    IconHeart,
    IconMessage2,
    IconMessage2Off,
} from "@tabler/icons-react";

import { PickedStoryProps } from "@/lib/types/story";
import { useDisclosure, useMounted } from "@mantine/hooks";
import { CreateCommentForm } from "../forms/comment/create-comment-form";
import { DeleteStory } from "./delete-story";
import { ShareStoryDrawer } from "./share-story-drawer";

export function StoryActions({ ...props }: PickedStoryProps) {
    const [openedStoryShare, { open: openStoryShare, close: closeStoryShare }] =
        useDisclosure(false);

    const [
        openedCommentForm,
        { toggle: toggleCommentForm, close: closeCommentForm },
    ] = useDisclosure(false);

    const mounted = useMounted();

    if (!mounted) return null;

    return (
        <Stack>
            <Group justify="space-between" grow>
                <IconHeart color="red" />
                <ActionIcon
                    onClick={toggleCommentForm}
                    color="gray"
                    variant="subtle"
                    flex={"130px  0"}
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
    );
}
