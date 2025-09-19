"use client";

import { PickedStoryProps } from "@/lib/types/story";
import {
    ActionIcon,
    CopyButton,
    Divider,
    Drawer,
    Group,
    Stack,
    Text,
} from "@mantine/core";
import { IconCheck, IconCopy, IconShare } from "@tabler/icons-react";
import { StoryTweetButton } from "../buttons/story-tweet-btn";

type ShareStoryDrawerProps = {
    story: PickedStoryProps;
    openedStoryShare: boolean;
    openStoryShare: () => void;
    closeStoryShare: () => void;
};

export function ShareStoryDrawer({
    story,
    openStoryShare,
    openedStoryShare,
    closeStoryShare,
}: ShareStoryDrawerProps) {
    return (
        <>
            <Drawer
                opened={openedStoryShare}
                onClose={closeStoryShare}
                title={`Share story ${story.title.toUpperCase()} on socials`}
                position="bottom"
                size={"xs"}
            >
                <Stack>
                    <Group justify="space-around">
                        <StoryTweetButton story={story} variant="subtle" />
                    </Group>

                    <Divider />

                    <Group>
                        <CopyStoryUrl isbn={story.isbn} />
                    </Group>
                </Stack>
            </Drawer>

            <ActionIcon
                onClick={openStoryShare}
                variant="subtle"
                flex={"100px  0"}
                color="cyan"
            >
                <Group>
                    <Text visibleFrom="sm" fw={500}>
                        Share
                    </Text>

                    <IconShare />
                </Group>
            </ActionIcon>
        </>
    );
}

export function CopyStoryUrl({ isbn }: { isbn: string }) {
    return (
        <CopyButton
            value={`https://achebestan.vercel.app/story/${isbn}`}
            timeout={2000}
        >
            {({ copied, copy }) => (
                <ActionIcon
                    variant="default"
                    onClick={copy}
                    flex={"120px  0"}
                    size={"input-md"}
                >
                    <Group gap={"xs"} wrap="nowrap">
                        {copied ? (
                            <IconCheck size={16} />
                        ) : (
                            <IconCopy size={16} />
                        )}

                        <Text visibleFrom="xs">
                            {copied ? "Copied" : "Copy URL"}
                        </Text>
                    </Group>
                </ActionIcon>
            )}
        </CopyButton>
    );
}
