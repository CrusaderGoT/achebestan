"use client";

import styles from "@/styles/not-found.module.css";
import { Button, Center, Container, Text, Title } from "@mantine/core";
import { IconArrowLeft, IconBook2, IconError404 } from "@tabler/icons-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <Container className={styles.container}>
            <div className={styles.content}>
                <Text className={styles.number}>404</Text>

                <Center>
                    <IconBook2 color="red" />
                    <IconError404 color="red" />
                </Center>

                <Title className={styles.title} order={1}>
                    Page Not Found
                </Title>

                <Text className={styles.description}>
                    The page you&apos;re looking for doesn&apos;t exist or has
                    been moved.
                </Text>

                <Button
                    component={Link}
                    href="/"
                    variant="subtle"
                    size="md"
                    leftSection={<IconArrowLeft size={18} stroke={2} />}
                    className={styles.button}
                >
                    Back to home
                </Button>
            </div>
        </Container>
    );
}
