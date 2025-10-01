"use client";

import { Button, Card, CloseButton, Group, Modal, Text } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    if (!showPrompt) return null;

    return (
        <Modal opened={showPrompt} onClose={() => setShowPrompt(false)}>
            <Card
                shadow="lg"
                padding="md"
                radius="md"
                withBorder
                style={{
                    position: "fixed",
                    bottom: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 1000,
                    maxWidth: 400,
                    width: "90%",
                }}
            >
                <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>
                        Install App
                    </Text>
                    <CloseButton onClick={() => setShowPrompt(false)} />
                </Group>
                <Text size="sm" c="dimmed" mb="md">
                    Install this app on your device for a better experience and
                    offline access.
                </Text>
                <Button
                    fullWidth
                    leftSection={<IconDownload size={16} />}
                    onClick={handleInstall}
                >
                    Install Now
                </Button>
            </Card>
        </Modal>
    );
}
