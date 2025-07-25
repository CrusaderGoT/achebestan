"use client";

import { Container, Grid, Stack } from "@mantine/core";

import { StoryBook } from "@/components/ui/story-book";
import HomeHero from "@/components/ui/home-hero";

export function HomePage() {
    return (
        <Stack>
            <HomeHero />

            <Grid
                component={Container}
                px={{ base: "md", md: "xl" }}
                gutter={{ base: "sm", sm: "md", lg: "xl" }}
                justify="center"
            >
                <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
                    <StoryBook
                        image="/images/demo.jpg"
                        title="The Sleepwalkers"
                        subtitle="A novel by Daniel Lundberg"
                        alt="The Sleepwalkers book cover with black and white wave pattern"
                        author="Achebestan"
                        isbn="234456797979"
                        content="The Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979"
                    />
                </Grid.Col>

                <Grid.Col
                    span={{ base: 12, xs: 6, md: 4 }}
                    mt={{ base: 0, xs: "100" }}
                >
                    <StoryBook
                        image="/images/demo.jpg"
                        title="The Sleepwalkers"
                        subtitle="A novel by Daniel Lundberg"
                        alt="The Sleepwalkers book cover with black and white wave pattern"
                        author="Achebestan"
                        isbn="234456797979"
                        content="The Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979"
                    />
                </Grid.Col>
                <Grid.Col span={{ base: 12, xs: 6, md: 4 }}>
                    <StoryBook
                        image="/images/demo.jpg"
                        title="The Sleepwalkers"
                        subtitle="A novel by Daniel Lundberg"
                        alt="The Sleepwalkers book cover with black and white wave pattern"
                        author="Achebestan"
                        isbn="234456797979"
                        content="The Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979"
                    />
                </Grid.Col>
                <Grid.Col
                    span={{ base: 12, xs: 6, md: 4 }}
                    mt={{ base: 0, xs: "100" }}
                >
                    <StoryBook
                        image="/images/demo.jpg"
                        title="The Sleepwalkers"
                        subtitle="A novel by Daniel Lundberg"
                        alt="The Sleepwalkers book cover with black and white wave pattern"
                        author="Achebestan"
                        isbn="234456797979"
                        content="The Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979 The Sleepwalkers A novel by Daniel Lundberg
                    Achebestan ISBN: 234456797979 The Sleepwalkers A novel by
                    Daniel Lundberg Achebestan ISBN: 234456797979 The
                    Sleepwalkers A novel by Daniel Lundberg Achebestan ISBN:
                    234456797979"
                    />
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
