"use client";

import { Group } from "@mantine/core";

import {
    IconBubble,
    IconCurrencyDollar,
    IconHeart,
    IconShare2,
} from "@tabler/icons-react";

import { useMounted } from "@mantine/hooks";
import { StoryTweetButton } from "../buttons/tweet-btn";
import { DeleteStory } from "./delete-story";

type StoryActionsProps = {
    isbn: string;
    storyTitle: string;
    authorId: string;
};

export function StoryActions({
    isbn,
    storyTitle,
    authorId,
}: StoryActionsProps) {
    const mounted = useMounted();

    if (!mounted) return null;

    return (
        <Group
            justify="space-between"
        >
            <IconHeart /> {/**favourite */}
            <IconBubble /> {/**comment toggle */}
            <IconCurrencyDollar /> {/**buy me coffee */}
            <IconShare2 /> {/**social share modal */}
            <StoryTweetButton storyTitle={storyTitle} isbn={isbn} />
            <DeleteStory
                isbn={isbn}
                storyTitle={storyTitle}
                authorId={authorId}
            />
        </Group>
    );
}
