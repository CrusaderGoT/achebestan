"use client";

import { WebShare } from "@/components/pwa/web-share";
import { BASE_URL } from "@/lib/constants";
import { createTweetText } from "@/lib/utils/story/story-utils";
import { PickedStoryProps } from "@/types/story";
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
import { StoryTweetButton } from "./story-tweet-btn";

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
                title={`Share story ${story.title.toUpperCase()}`}
                position="bottom"
                size={"xs"}
            >
                <Stack>
                    <Group grow>
                        <StoryTweetButton story={story} variant="subtle" />
                    </Group>

                    <Divider />

                    <Group grow>
                        <CopyStoryUrl isbn={story.isbn} />
                        <WebShare
                            title={`Achebestan - Share ${story.title}`}
                            text={createTweetText({
                                title: story.title,
                                blurb: story.blurb,
                            })}
                            url={`${BASE_URL}/story/${story.isbn}`}
                        />
                    </Group>
                </Stack>
            </Drawer>

            <ActionIcon onClick={openStoryShare} variant="subtle" color="cyan">
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
        <CopyButton value={`${BASE_URL}/story/${isbn}`} timeout={2000}>
            {({ copied, copy }) => (
                <ActionIcon variant="default" onClick={copy}>
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
