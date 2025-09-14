"use client";

import { Group } from "@mantine/core";

import {
    IconBubble,
    IconCurrencyDollar,
    IconHeart,
    IconShare2,
} from "@tabler/icons-react";

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
    return (
        <Group>
            <IconHeart /> {/**favourite */}
            <IconBubble /> {/**comment toggle */}
            <IconCurrencyDollar /> {/**buy me coffee */}
            <IconShare2 /> {/**social share */}
            <DeleteStory
                isbn={isbn}
                storyTitle={storyTitle}
                authorId={authorId}
            />
        </Group>
    );
}
