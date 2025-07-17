"use client";

import {
    Group,
    Image as MantineImage,
    Stack,
    Text,
    Title,
    useComputedColorScheme,
} from "@mantine/core";
import Image from "next/image";

export function HomePage() {
    return (
        <Stack>
            <HomeHero />
        </Stack>
    );
}

function HomeHero() {
    const computedColorScheme = useComputedColorScheme();
    
    return (
        <Group gap={0}>
            <Stack
                flex={1}
                justify="center"
                style={{
                    height: "100vh",
                }}
                px={"80"}
                gap={"md"}
                bg={"gray"}
            >
                <Title order={1}>Achebestan</Title>
                <Text>
                    Daniel Lunsford Author of the best-selling books Life for
                    Rent, The Sleepwalkers, Infinity Expired and many more
                </Text>

                <Text>Buy Daniels Books</Text>
            </Stack>

            <Stack
                align="center"
                justify="end"
                style={{
                    height: "100vh",
                    paddingBottom: "50px",
                }}
                flex={1}
                px={"80"}
                miw={"50%"}
                bg={computedColorScheme === "light" ? "gray.1" : "gray.9"}
                gap={0}
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
                <Text
                    style={{
                        marginLeft: "auto",
                        transform: "rotateZ(-10deg)",
                        fontStyle: "italic",
                        fontSize: "20px",
                    }}
                >
                    Crusader
                </Text>
            </Stack>
        </Group>
    );
}
