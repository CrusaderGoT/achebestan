

import styles from "@/styles/home-hero.module.css";
import publicStyles from "@/styles/public.module.css";
import cx from "clsx";

import { useCentralizedAuth } from "@/lib/auth/centralized-auth-context-provider";
import { Flex, Mark, Skeleton, Stack, Text, Title } from "@mantine/core";
import { HomeImageBox } from "./home-image";

function HomeHero() {
    const { sessionUser } = useCentralizedAuth();

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
                {sessionUser.isPending ? (
                    <Skeleton animate width={300} height={200} />
                ) : (
                    <HomeImageBox session={sessionUser.data} />
                )}

                <Text className={styles.heroSignature}>
                    {sessionUser.isPending ||
                    !sessionUser.data?.user ||
                    sessionUser.data.user.isAnonymous
                        ? "Achebestan"
                        : sessionUser.data.user.name}
                </Text>
            </Stack>
        </Flex>
    );
}

export default HomeHero;
