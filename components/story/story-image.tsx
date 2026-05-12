"use client";

import { UserSelectType } from "@/types/user";
import { Avatar, Badge, Box, Code, Group, Image } from "@mantine/core";
import { IconUserCircle } from "@tabler/icons-react";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story/story-page.module.css";
import cx from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/navigation";

dayjs.extend(relativeTime);

type StoryImageType = {
    image: string | null;
    title: string;
    author: UserSelectType;
    created: Date;
    edited: Date | null;
    openedImageField: boolean;
};

export function StoryImage({
    image,
    title,
    author,
    openedImageField,
    created,
    edited,
}: StoryImageType) {
    const router = useRouter();

    return (
        <Box className={cx(openedImageField && publicStyles.hide)}>
            <Box className={storypageStyles.storyImage}>
                <Image src={image} alt={title} />
            </Box>

            <Box className={storypageStyles.storyBadgeTime}>
                <Badge
                    leftSection={
                        <Avatar src={author.image} size={20} variant="filled">
                            <IconUserCircle />
                        </Avatar>
                    }
                    onClick={() => router.push(`/users/${author.id}`)}
                >
                    {author.name}
                </Badge>

                <Group>
                    <Code>
                        published: {dayjs(created).format("DD-MMM-YYYY")}
                    </Code>
                    {edited && (
                        <Code>last edited: {dayjs(edited).fromNow()}</Code>
                    )}
                </Group>
            </Box>
        </Box>
    );
}
