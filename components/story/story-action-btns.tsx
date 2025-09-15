"use client";

import { Group } from "@mantine/core";

import {
    IconBubble,
    IconCurrencyDollar,
    IconHeart,
    IconShare2,
} from "@tabler/icons-react";

import { StorySelectType } from "@/zod-schemas/story";
import { useMounted } from "@mantine/hooks";
import { StoryTweetButton } from "../buttons/tweet-btn";
import { DeleteStory } from "./delete-story";

type StoryActionsProps = {
    story: Omit<StorySelectType, "content">;
};

export function StoryActions({ story }: StoryActionsProps) {
    const mounted = useMounted();

    if (!mounted) return null;

    return (
        <Group justify="space-between">
            <IconHeart /> {/**favourite */}
            <IconBubble /> {/**comment toggle */}
            <IconCurrencyDollar /> {/**buy me coffee */}
            <IconShare2 /> {/**social share modal */}
            <StoryTweetButton story={story} variant="subtle" />
            <DeleteStory
                isbn={story.isbn}
                storyTitle={story.title}
                authorId={story.authorId}
            />
        </Group>
    );
}
