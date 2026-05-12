"use client";

import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import styles from "@/styles/home-hero.module.css";
import { Box, Mark, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import cx from "clsx";
import { HomeImageBox } from "./home-image";

function HomeHero() {
    const { sessionUser } = useCentralizedAuth();
    const mounted = useMounted();
    const showSkeleton = !mounted || sessionUser.isPending;

    const displayName =
        mounted && sessionUser.data?.user && !sessionUser.data.user.isAnonymous
            ? sessionUser.data.user.name
            : "Achebestan";

    return (
        <Box className={styles.heroContainer}>
            <Stack
                className={cx(styles.heroSection, styles.heroDescSection)}
                gap="xl"
            >
                <Box>
                    <Title order={1} className={styles.title} size="h1">
                        Achebestan
                    </Title>
                    <Text
                        size="xl"
                        fw={500}
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Welcome to a world of Imagination.
                    </Text>
                </Box>

                <Stack gap="md">
                    <Text className={styles.description} size="lg">
                        Hi, I am{" "}
                        <Mark className={styles.highlightText} px={4}>
                            Achebestan.
                        </Mark>{" "}
                        And you are currently at my{" "}
                        <strong>Mind&apos;s Palace</strong> — a sanctuary where I
                        post my fictional stories, concoctions of my
                        imagination, sensations of my life, and a programming
                        standard or two.
                    </Text>

                    <Text className={styles.accentText}>
                        Consume Responsibly. . .
                    </Text>
                </Stack>
            </Stack>

            <Stack
                className={cx(styles.heroSection, styles.heroImageSection)}
                align="center"
                justify="center"
            >
                {showSkeleton ? (
                    <Skeleton height={400} width={400} radius="40px" animate />
                ) : (
                    <HomeImageBox session={sessionUser.data} />
                )}
                <Text className={styles.heroSignature}>{displayName}</Text>
            </Stack>
        </Box>
    );
}

export default HomeHero;
