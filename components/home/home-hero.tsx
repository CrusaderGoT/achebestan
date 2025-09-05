"use client";

import styles from "@/styles/home-hero.module.css";
import publicStyles from "@/styles/public.module.css";
import cx from "clsx";

import {
    Flex,
    Image as MantineImage,
    Mark,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import Image from "next/image";

function HomeHero() {
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
                <figure>
                    <MantineImage
                        component={Image}
                        src={"/images/demo.jpg"}
                        alt="image"
                        width={998}
                        height={998}
                        className={styles.heroImage}
                    />
                    <figcaption>A Mad Man, circa 2025</figcaption>
                </figure>
                <Text className={styles.heroSignature}>Crusader</Text>
            </Stack>
        </Flex>
    );
}

export default HomeHero;
