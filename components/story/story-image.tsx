"use client";

import { userSelectType } from "@/zod-schemas/user";
import { Avatar, Badge, Box, Code, Group, Image } from "@mantine/core";
import { IconUserCircle } from "@tabler/icons-react";

import publicStyles from "@/styles/public.module.css";
import storypageStyles from "@/styles/story-page.module.css";
import cx from "clsx";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type StoryImageType = {
    image: string | null;
    title: string;
    author: userSelectType;
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
    return (
        <Box className={cx(openedImageField && publicStyles.hide)}>
            <Box>
                <Image
                    src={image}
                    alt={title}
                    className={storypageStyles.storyImage}
                />
            </Box>

            <Box className={storypageStyles.storyBadgeTime}>
                <Badge
                    leftSection={
                        <Avatar src={author.image} size={20} variant="filled">
                            <IconUserCircle />
                        </Avatar>
                    }
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
