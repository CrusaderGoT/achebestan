"use client";

import storybookStyles from "@/styles/story-book.module.css";
import cx from "clsx";

import { StoryBookProps } from "@/types/story";
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
import { NavigationLink } from "../ui/route-navigation-progress";

export function StoryBook({
    image,
    title,
    subtitle,
    author,
    isbn,
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
                            alt={title}
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
                                {author.name}
                            </Text>

                            <Text className={storybookStyles.isbn}>
                                ISBN: {isbn}
                            </Text>
                        </Stack>
                    </Box>
                </Box>

                <Center className={storybookStyles.storybookFooter}>
                    <Text className={storybookStyles.title} truncate="end">
                        {title}
                    </Text>

                    <Button
                        variant="outline"
                        className={storybookStyles.navigate}
                        href={`/story/${isbn}`}
                        component={NavigationLink}
                    >
                        Read
                    </Button>
                </Center>
            </Stack>

            {blurb && (
                <Center
                    ref={ref}
                    className={cx(
                        width < 120
                            ? storybookStyles.hideParagraph
                            : storybookStyles.showParagraph,
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
