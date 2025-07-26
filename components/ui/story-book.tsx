"use client";

import storybookStyles from "@/styles/story-book.module.css";
import storypageStyles from "@/styles/story-page.module.css";

import cx from "clsx";

import { StorySelectType } from "@/zod-schemas/story";
import { userSelectType } from "@/zod-schemas/user";
import {
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    Center,
    Code,
    Flex,
    Group,
    Image,
    Image as MantineImage,
    ScrollArea,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { IconUserCircle } from "@tabler/icons-react";

interface StoryBookProps extends StorySelectType {
    alt?: string;
    authorName?: string;
    navigate?: boolean;
}

export function StoryBook({
    image,
    title,
    subtitle,
    alt,
    authorName,
    isbn,
    navigate = true,
    content,
}: StoryBookProps) {
    const { ref, width } = useElementSize();

    return (
        <Flex gap={"xs"}>
            <Stack className={storybookStyles.storybookContainer}>
                <Box className={storybookStyles.storybook}>
                    <Box className={storybookStyles.storybookSpine} />
                    <Box className={storybookStyles.storybookCover}>
                        <MantineImage
                            src={image}
                            alt={alt || title}
                            className={storybookStyles.storybookImage}
                        />
                        <Stack className={storybookStyles.storybookText}>
                            <Text className={storybookStyles.storybookTitle}>
                                {title}
                            </Text>
                            <Text className={storybookStyles.storybookSubtitle}>
                                {subtitle}
                            </Text>

                            <Text className={storybookStyles.storybookAuthor}>
                                {authorName}
                            </Text>

                            <Text className={storybookStyles.isbn}>
                                ISBN: {isbn}
                            </Text>
                        </Stack>
                    </Box>
                </Box>
                {navigate && (
                    <Center className={storybookStyles.storybookFooter}>
                        <Text className={storybookStyles.title}>{title}</Text>

                        <Button
                            variant="outline"
                            className={storybookStyles.navigate}
                            component="a"
                            href={`/story/${isbn}`}
                        >
                            Goto
                        </Button>
                    </Center>
                )}
            </Stack>

            <Center
                ref={ref}
                className={cx(
                    width < 120
                        ? storybookStyles.hideParagraph
                        : storybookStyles.showParagraph
                )}
            >
                <Text
                    lineClamp={7}
                    className={storybookStyles.storybookParagraph}
                >
                    {content}
                </Text>
            </Center>
        </Flex>
    );
}

interface StoryProps extends StorySelectType {
    author: userSelectType;
}

export function Story({
    image,
    author,
    title,
    content,
    created,
    edited,
}: StoryProps) {
    return (
        <Card className={storypageStyles.storyCard} withBorder>
            <Card.Section className={storypageStyles.storyImageSection}>
                <Image
                    src={image}
                    alt={title}
                    className={storypageStyles.storyImage}
                />

                <Box className={storypageStyles.storyBadgeTime}>
                    <Badge
                        leftSection={
                            <Avatar
                                src={author.image}
                                size={20}
                                variant="filled"
                            >
                                <IconUserCircle />
                            </Avatar>
                        }
                    >
                        {author.name}
                    </Badge>

                    <Group>
                        <Code>created: {created.toLocaleTimeString()}</Code>
                        {edited && (
                            <Code>
                                last edited: {edited.toLocaleTimeString()}
                            </Code>
                        )}
                    </Group>
                </Box>
            </Card.Section>

            <Stack>
                <Title>{title}</Title>

                <ScrollArea>
                    <Box dangerouslySetInnerHTML={{ __html: content }} />
                </ScrollArea>
            </Stack>
        </Card>
    );
}

export default Story;
