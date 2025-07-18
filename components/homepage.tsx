"use client";

import styles from "@/styles/home-hero.module.css";
import {
    Group,
    Image as MantineImage,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import cx from "clsx";
import Image from "next/image";
import Book from "@/components/book";

export function HomePage() {
    return (
        <Stack>
            <HomeHero />
            <Book
                image="/images/demo.jpg"
                title="The Sleepwalkers"
                subtitle="A novel by Daniel Lundberg"
                alt="The Sleepwalkers book cover with black and white wave pattern"
                author="Achebestan"
                isbn="234456797979"
            />
        </Stack>
    );
}

function HomeHero() {
    return (
        <Group gap={0}>
            <Stack
                flex={1}
                className={cx(styles.heroSection, styles.heroDescSection)}
            >
                <Title order={1}>Achebestan</Title>
                <Text>
                    Daniel Lunsford Author of the best-selling books Life for
                    Rent, The Sleepwalkers, Infinity Expired and many more
                </Text>

                <Text>Buy Daniels Books</Text>
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
                        h={"auto"}
                    />
                    <figcaption>
                        Winner of the Golden Ink Award, 2035
                    </figcaption>
                </figure>
                <Text className={styles.heroSignature}>Crusader</Text>
            </Stack>
        </Group>
    );
}
