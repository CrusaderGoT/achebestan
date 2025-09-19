"use client";

import { PickedStoryProps } from "@/lib/types/story";
import { createTweetText } from "@/lib/utils/helpers";
import { ActionIcon, ActionIconProps, Group, Text } from "@mantine/core";
import { IconBrandX } from "@tabler/icons-react";
import { useMemo } from "react";

type StoryTweetButtonProps = {
    story: PickedStoryProps;
    baseUrl?: string;
    hashtags?: string[];
    via?: string;
    customText?: string;
} & ActionIconProps;

export function StoryTweetButton({
    story,
    baseUrl = "https://achebestan.vercel.app",
    hashtags = ["story", "reading"],
    via = "achebestan",
    customText,
    ...props
}: StoryTweetButtonProps) {
    const shareUrl = useMemo(() => {
        // Create the story URL
        const storyUrl = `${baseUrl}/story/${story.isbn}`;

        // Create the tweet text
        const tweetText = customText || createTweetText(story);

        // Build URL parameters
        const params = new URLSearchParams({
            text: tweetText,
            url: storyUrl,
            ...(hashtags.length > 0 && { hashtags: hashtags.join(",") }),
            ...(via && { via }),
        });

        return `https://twitter.com/intent/tweet?${params.toString()}`;
    }, [story, baseUrl, hashtags, via, customText]);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        // Open in popup window for better UX
        const popup = window.open(
            shareUrl,
            "twitter-share",
            "width=550,height=420,resizable=yes,scrollbars=yes"
        );

        if (!popup) {
            // Fallback if popup is blocked
            window.open(shareUrl, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <ActionIcon
            onClick={handleClick}
            aria-label={`Share ${story.title} on X (Twitter)`}
            title={`Share ${story.title} on X`}
            flex={"100px  0"}
            mr={"auto"}
            {...props}
        >
            <Group wrap="nowrap" gap={5}>
                <IconBrandX stroke={1.5} />
                <Text visibleFrom="sm">Twitter</Text>
            </Group>
        </ActionIcon>
    );
}
