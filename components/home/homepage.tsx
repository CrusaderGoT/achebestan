"use client";

import { Container, Grid, Stack } from "@mantine/core";

import HomeHero from "@/components/home/home-hero";
import { StoryBook } from "@/components/home/story-book";
import { useExitOnHomePage } from "@/lib/hooks/home/use-exit-on-home-page";
import { StoryBookProps } from "@/types/story";
import { ServiceWorkerUpdate } from "../pwa/service-worker-update";

export function HomePage({
    stories,
}: {
    stories: StoryBookProps[] | undefined;
}) {
    // hook for app like exit on standalone
    useExitOnHomePage();

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
                                <StoryBook {...story} />
                            </Grid.Col>
                        );
                    })}
                </Grid>
            )}

            <ServiceWorkerUpdate />
        </Stack>
    );
}
