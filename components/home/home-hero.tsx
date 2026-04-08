"use client";

import styles from "@/styles/home-hero.module.css";
import publicStyles from "@/styles/public.module.css";
import cx from "clsx";

import { useCentralizedAuth } from "@/lib/contexts/centralized-auth-context-provider";
import { Flex, Mark, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
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
        <Flex gap={0} direction={{ base: "column", md: "row" }}>
            <Stack
                flex={1}
                className={cx(styles.heroSection, styles.heroDescSection)}
            >
                <Title order={1}>Achebestan</Title>
                <Text>Welcome to a world of Imagination.</Text>
                <Text>
                    Hi, I am{" "}
                    <Mark className={publicStyles.highlightText2}>
                        Achebestan.
                    </Mark>{" "}
                    And you are currently at my Mind&apos;s Palace, this is a
                    place where I post my fictional stories, concoctions of my
                    imagination, sensations of my life, and maybe a programming
                    standard or two.
                </Text>

                <Text>Consume Responsibly. . .</Text>
            </Stack>

            <Stack
                flex={1}
                gap={0}
                className={cx(styles.heroSection, styles.heroImageSection)}
            >
                {showSkeleton ? (
                    <Skeleton animate width={300} height={200} />
                ) : (
                    <HomeImageBox session={sessionUser.data} />
                )}

                <Text className={styles.heroSignature}>{displayName}</Text>
            </Stack>
        </Flex>
    );
}

export default HomeHero;
