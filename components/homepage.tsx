"use client";

import { Grid, Stack } from "@mantine/core";

import Book from "@/components/book";
import HomeHero from "@/components/home-hero";

export function HomePage() {
    return (
        <Stack>
            <HomeHero />
            <Grid overflow="hidden">
                <Grid.Col span={4} offset={1}>
                    <Book
                        image="/images/demo.jpg"
                        title="The Sleepwalkers"
                        subtitle="A novel by Daniel Lundberg"
                        alt="The Sleepwalkers book cover with black and white wave pattern"
                        author="Achebestan"
                        isbn="234456797979"
                    />
                </Grid.Col>

                <Grid.Col span={4} offset={3}>
                    <Book
                        image="/images/demo.jpg"
                        title="The Sleepwalkers"
                        subtitle="A novel by Daniel Lundberg"
                        alt="The Sleepwalkers book cover with black and white wave pattern"
                        author="Achebestan"
                        isbn="234456797979"
                    />
                </Grid.Col>
                <Grid.Col span={4} offset={2}>
                    <Book
                        image="/images/demo.jpg"
                        title="The Sleepwalkers"
                        subtitle="A novel by Daniel Lundberg"
                        alt="The Sleepwalkers book cover with black and white wave pattern"
                        author="Achebestan"
                        isbn="234456797979"
                    />
                </Grid.Col>
                <Grid.Col span={4} offset={1}>
                    <Book
                        image="/images/demo.jpg"
                        title="The Sleepwalkers"
                        subtitle="A novel by Daniel Lundberg"
                        alt="The Sleepwalkers book cover with black and white wave pattern"
                        author="Achebestan"
                        isbn="234456797979"
                    />
                </Grid.Col>
            </Grid>
        </Stack>
    );
}
