"use client";

import { ActionIcon } from "@mantine/core";
import { IconBrandTwitterFilled } from "@tabler/icons-react";

type StoryTweetButtonProps = {
    storyTitle: string;
    isbn: string;
};
export function StoryTweetButton({ storyTitle, isbn }: StoryTweetButtonProps) {
    return (
        <ActionIcon
            className="twitter-share-button"
            component="a"
            href={`https://twitter.com/intent/tweet?text=${storyTitle.toUpperCase()}&url=https://achebestan.vercel.app/story/${isbn}&hastags=hello,world&via=achebestan`}
            variant="subtle"
            target="_blank"
        >
            <IconBrandTwitterFilled stroke={1.5} />
        </ActionIcon>
    );
}
