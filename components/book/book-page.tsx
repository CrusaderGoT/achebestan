"use client";

import classes from "@/styles/book/book-page.module.css";
import { BookAndStoriesType } from "@/types/books";
import {
    Anchor,
    Avatar,
    Badge,
    Box,
    Container,
    Divider,
    Group,
    Stack,
    Text,
    Title,
    UnstyledButton,
} from "@mantine/core";
import {
    IconArrowRight,
    IconBook,
    IconCalendar,
    IconChevronRight,
} from "@tabler/icons-react";
import cx from "clsx";
import dayjs from "dayjs";
import Link from "next/link";

/**
 * StoryRow: Individual chapter list item
 */
function StoryRow({ story, index }: { story: any; index: number }) {
    const partNumber = story.bookPart ?? index + 1;

    return (
        <UnstyledButton
            component={Link}
            href={`/stories/${story.isbn}`}
            className={cx(classes.storyRow, classes.animatedEntry)}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <Group align="flex-start" wrap="nowrap" gap="xl">
                {/* Editorial Part Number */}
                <Stack gap={0} visibleFrom="sm" w={60}>
                    <Text size="xs" c="dimmed" tt="uppercase" lts="0.1em">
                        Part
                    </Text>
                    <Text className={classes.storyNumber}>
                        {String(partNumber).padStart(2, "0")}
                    </Text>
                </Stack>

                {/* Content */}
                <Stack gap="xs" flex={1} className={classes.contentContainer}>
                    <Title
                        order={3}
                        size="h4"
                        fw={600}
                        c="var(--color-text-primary)"
                    >
                        {story.title}
                    </Title>
                    {story.subtitle && (
                        <Text
                            fs="italic"
                            c="var(--color-text-secondary)"
                            size="sm"
                        >
                            {story.subtitle}
                        </Text>
                    )}
                    {story.blurb && (
                        <Text
                            c="dimmed"
                            size="sm"
                            lineClamp={2}
                            style={{ maxWidth: "60ch" }}
                        >
                            {story.blurb}
                        </Text>
                    )}
                </Stack>

                <Box className={classes.arrowIcon}>
                    <IconArrowRight size={24} stroke={1.5} />
                </Box>
            </Group>
        </UnstyledButton>
    );
}

/**
 * Main BookPage Component
 */
export function BookPage({ author, stories, ...book }: BookAndStoriesType) {
    if (!book) return null;

    return (
        <Box className={classes.pageContainer}>
            {/* Editorial Hero Header */}
            <Box component="header" className={classes.hero}>
                <Container size="lg">
                    <Stack gap="xl">
                        {/* Breadcrumbs */}
                        <Group gap={8}>
                            <Anchor
                                component={Link}
                                href="/"
                                size="xs"
                                c="dimmed"
                                tt="uppercase"
                            >
                                Home
                            </Anchor>
                            <IconChevronRight
                                size={12}
                                color="var(--color-text-muted)"
                            />
                            <Anchor
                                component={Link}
                                href="/books"
                                size="xs"
                                c="dimmed"
                                tt="uppercase"
                            >
                                Books
                            </Anchor>
                        </Group>

                        {/* Title Block */}
                        <Stack gap="md">
                            <Badge
                                variant="outline"
                                color="var(--color-accent)"
                                radius="sm"
                                tt="uppercase"
                            >
                                Original Collection
                            </Badge>
                            <Title
                                order={1}
                                className={classes.bookTitle}
                                size="4rem"
                            >
                                {book.name}
                            </Title>
                        </Stack>

                        {/* Meta Section */}
                        <Group gap="xl" align="center">
                            <UnstyledButton
                                component={Link}
                                href={`/users/${book.authorId}`}
                            >
                                <Group gap="sm">
                                    <Avatar
                                        src={author.image}
                                        radius="xl"
                                        size="md"
                                        color="var(--color-accent)"
                                    >
                                        {author.name.slice(0, 2).toUpperCase()}
                                    </Avatar>
                                    <Stack gap={0}>
                                        <Text
                                            size="xs"
                                            tt="uppercase"
                                            c="dimmed"
                                            lts="0.05em"
                                        >
                                            Curated By
                                        </Text>
                                        <Text fw={600} size="sm">
                                            {author.name}
                                        </Text>
                                    </Stack>
                                </Group>
                            </UnstyledButton>

                            <Divider orientation="vertical" visibleFrom="xs" />

                            <Group gap="lg">
                                <Group gap={6}>
                                    <IconBook
                                        size={18}
                                        color="var(--color-accent)"
                                        stroke={1.5}
                                    />
                                    <Text size="sm" fw={500}>
                                        {stories.length} Chapters
                                    </Text>
                                </Group>
                                <Group gap={6}>
                                    <IconCalendar
                                        size={18}
                                        color="var(--color-accent)"
                                        stroke={1.5}
                                    />
                                    <Text size="sm" fw={500}>
                                        {dayjs(book.created).format("MMM YYYY")}
                                    </Text>
                                </Group>
                            </Group>
                        </Group>
                    </Stack>
                </Container>
            </Box>

            {/* Chapters Listing */}
            <Box component="section" py={80}>
                <Container size="lg">
                    <Group justify="space-between" mb={40} align="flex-end">
                        <Stack gap={4}>
                            <Text
                                tt="uppercase"
                                size="xs"
                                fw={700}
                                lts="0.2em"
                                c="var(--color-accent)"
                            >
                                Table of Contents
                            </Text>
                            <Box h={2} w={40} bg="var(--color-accent)" />
                        </Stack>
                        <Text size="xs" c="dimmed" ff="mono">
                            IDX // {stories.length.toString().padStart(3, "0")}
                        </Text>
                    </Group>

                    <Stack gap={0}>
                        {stories.length > 0 ? (
                            stories.map((story, index) => (
                                <StoryRow
                                    key={story.isbn}
                                    story={story}
                                    index={index}
                                />
                            ))
                        ) : (
                            <Stack align="center" py={100} gap="md">
                                <IconBook
                                    size={48}
                                    stroke={1}
                                    color="var(--color-text-muted)"
                                />
                                <Text size="lg" ff="serif" fs="italic">
                                    This palace wing is currently silent.
                                </Text>
                                <Text c="dimmed" size="sm">
                                    New chronicles are being penned as we speak.
                                </Text>
                            </Stack>
                        )}
                    </Stack>
                </Container>
            </Box>

            {/* Editorial Footer */}
            <Box component="footer" className={classes.footer}>
                <Container size="lg">
                    <Divider
                        mb="xl"
                        label="End of Collection"
                        labelPosition="center"
                    />
                    <Group justify="center">
                        <Anchor
                            component={Link}
                            href={`/users/${book.authorId}`}
                            c="var(--color-text-primary)"
                            underline="hover"
                        >
                            <Group gap="xs">
                                <Text size="sm" fw={500}>
                                    Explore more by {author.name}
                                </Text>
                                <IconArrowRight size={16} />
                            </Group>
                        </Anchor>
                    </Group>
                </Container>
            </Box>
        </Box>
    );
}
