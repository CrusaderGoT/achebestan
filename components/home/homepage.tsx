"use client";

import { Container, Grid, Stack } from "@mantine/core";

import HomeHero from "@/components/home/home-hero";
import { StoryBook } from "@/components/home/story-book";
import { StoryBookProps } from "@/lib/types/story";

export function HomePage({
    stories,
}: {
    stories: StoryBookProps[] | undefined;
}) {
    return (
        <Stack>
            <HomeHero />

            {stories && (
                <Grid
                    component={Container}
                    px={{ base: "md", md: "xl" }}
                    gutter={{ base: "sm", sm: "md", lg: "xl" }}
                    justify="center"
                >
                    {stories.map((story, index) => {
                        return (
                            <Grid.Col
                                span={{ base: 12, xs: 6, md: 4 }}
                                mt={{ base: 0, xs: index % 2 === 0 ? 0 : 100 }}
                                key={index}
                            >
                                <StoryBook
                                    key={story.id}
                                    id={story.id}
                                    image={story.image}
                                    title={story.title}
                                    subtitle={story.subtitle}
                                    alt={story.title}
                                    authorName={story.author.name}
                                    isbn={story.isbn}
                                    content={story.content}
                                    created={story.created}
                                    edited={story.edited}
                                    authorId={story.authorId}
                                    bookId={story.bookId}
                                    blurb={story.blurb}
                                />
                            </Grid.Col>
                        );
                    })}
                </Grid>
            )}
        </Stack>
    );
}
