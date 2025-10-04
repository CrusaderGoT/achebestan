"use client";

import styles from "@/styles/home-hero.module.css";
import publicStyles from "@/styles/public.module.css";
import cx from "clsx";

import { authClient } from "@/lib/auth-client";

import { Flex, Mark, Skeleton, Stack, Text, Title } from "@mantine/core";
import { HomeImageBox } from "./home-image";

function HomeHero() {
    const { data: session, isPending } = authClient.useSession();

    return (
        <Flex gap={0} direction={{ base: "column", md: "row" }}>
            <Stack
                flex={1}
                className={cx(styles.heroSection, styles.heroDescSection)}
            >
                <Title order={1}>Achebestan</Title>
                <Text>Welcome to a world of Imagination.</Text>
                <Text>
                    Hi, I am Enemchukwu Chukwuemeka also known as{" "}
                    <Mark className={publicStyles.highlightText2}>
                        Achebestan
                    </Mark>
                    . And you are currently at my Mind&apos;s Palace, this is a
                    place where i post my fictional stories, concoctions of my
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
                {isPending ? (
                    <Skeleton animate />
                ) : (
                    <HomeImageBox session={session} />
                )}

                <Text className={styles.heroSignature}>
                    {isPending || !session?.user || session.user.isAnonymous
                        ? "Achebestan"
                        : session.user.name}
                </Text>
            </Stack>
        </Flex>
    );
}

export default HomeHero;
