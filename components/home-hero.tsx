import styles from "@/styles/home-hero.module.css";
import { Flex, Image as MantineImage, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";

import cx from "clsx";

function HomeHero() {
    return (
        <Flex gap={0} direction={{ base: "column", md: "row" }}>
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
                        className={styles.heroImage}
                    />
                    <figcaption>
                        Winner of the Golden Ink Award, 2035
                    </figcaption>
                </figure>
                <Text className={styles.heroSignature}>Crusader</Text>
            </Stack>
        </Flex>
    );
}

export default HomeHero;
