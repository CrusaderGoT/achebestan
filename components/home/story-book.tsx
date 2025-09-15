"use client";

import storybookStyles from "@/styles/story-book.module.css";
import cx from "clsx";

import { StorySelectType } from "@/zod-schemas/story";
import {
    Box,
    Button,
    Center,
    Flex,
    Image as MantineImage,
    Stack,
    Text,
} from "@mantine/core";
import { useElementSize } from "@mantine/hooks";

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
    blurb,
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

            {blurb && (
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
                        {blurb}
                    </Text>
                </Center>
            )}
        </Flex>
    );
}
