"use client";

import styles from "@/styles/story-book.module.css";
import storyStyles from "@/styles/story-page.module.css";

import cx from "clsx";

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

type StoryBookProps = {
    image: string;
    title: string;
    subtitle: string;
    alt?: string;
    author?: string;
    isbn?: string;
    navigate?: boolean;
    content: string;
};

export function StoryBook({
    image,
    title,
    subtitle,
    alt,
    author,
    isbn,
    navigate = true,
    content,
}: StoryBookProps) {
    const { ref, width } = useElementSize();

    return (
        <Flex gap={"xs"}>
            <Stack className={styles.storybookContainer}>
                <Box className={styles.storybook}>
                    <Box className={styles.storybookSpine} />
                    <Box className={styles.storybookCover}>
                        <MantineImage
                            src={image}
                            alt={alt || title}
                            className={styles.storybookImage}
                        />
                        <Box className={styles.storybookText}>
                            <Text className={styles.storybookTitle}>
                                {title}
                            </Text>
                            <Text className={styles.storybookSubtitle}>
                                {subtitle}
                            </Text>
                            {author && (
                                <Text className={styles.storybookAuthor}>
                                    {author}
                                </Text>
                            )}
                            {isbn && (
                                <Text className={styles.isbn}>
                                    ISBN: {isbn}
                                </Text>
                            )}
                        </Box>
                    </Box>
                </Box>
                {navigate && (
                    <Center className={styles.storybookFooter}>
                        <Text className={styles.title}>{title}</Text>

                        <Button variant="outline" className={styles.navigate}>
                            Goto
                        </Button>
                    </Center>
                )}
            </Stack>

            <Center
                ref={ref}
                className={cx(
                    width < 120 ? styles.hideParagraph : styles.showParagraph
                )}
            >
                <Text lineClamp={7} className={styles.storybookParagraph}>
                    {content}
                </Text>
            </Center>
        </Flex>
    );
}

export type StoryProps = {
    image?: string;
    author: string;
    title: string;
    content: string;
    created: Date;
    edited?: Date;
};

export function Story({
    image,
    author,
    title,
    content,
    created,
    edited,
}: StoryProps) {
    return (
        <Card className={storyStyles.storyCard} withBorder>
            <Card.Section className={storyStyles.storyImageSection}>
                <Image
                    src={image}
                    alt={title}
                    className={storyStyles.storyImage}
                />

                <Box className={storyStyles.storyBadgeTime}>
                    <Badge
                        leftSection={
                            <Avatar src={null} size={20} variant="filled">
                                <IconUserCircle />
                            </Avatar>
                        }
                    >
                        {author}
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

            <Title>{title}</Title>

            <ScrollArea>
                <Text>{content}</Text>
            </ScrollArea>
        </Card>
    );
}

export default Story;
