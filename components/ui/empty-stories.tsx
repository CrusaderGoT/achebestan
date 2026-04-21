import classes from "@/styles/story/empty-stories.module.css";
import { Center, Stack, Text, Title } from "@mantine/core";
import { IconMoodEmpty } from "@tabler/icons-react";

export function EmptyStoriesHero() {
    return (
        <Center>
            <Stack align="center" gap="xl" className={classes.content}>
                <Stack gap="xs" align="center">
                    <IconMoodEmpty />

                    <Title className={classes.title}>
                        The library is empty.
                    </Title>

                    <Text size="lg" className={classes.description}>
                        No stories have been told here, yet.
                    </Text>
                </Stack>
            </Stack>
        </Center>
    );
}
