"use client";

import { Button, Card, CloseButton, Group, Modal, Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconDownload } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
    const [declined, setDeclined] = useLocalStorage<string | null>({
        key: "lastPwaInstallPromptDecline",
        defaultValue: null,
        serialize: (value) => value || "",
        deserialize: (value) => value || null,
    });

    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);

    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();

            // check if it has not declined before or it's been more than 7 days since last decline
            const shouldShow =
                !declined || dayjs().diff(dayjs(declined), "days") >= 7;

            if (shouldShow) {
                setDeferredPrompt(e as BeforeInstallPromptEvent);
                setShowPrompt(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, [declined]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    const handleDecline = () => {
        setDeclined(dayjs().toISOString());
        setShowPrompt(false);
        setDeferredPrompt(null);
    };

    if (!showPrompt) return null;

    return (
        <Modal
            opened={showPrompt}
            onClose={handleDecline}
            centered
            withCloseButton={false}
        >
            <Card shadow="lg" padding="md" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500}>
                        Install App
                    </Text>
                    <CloseButton onClick={handleDecline} />
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
