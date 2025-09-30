"use client";

import { Button, Modal, Stack, Text, Title } from "@mantine/core";
import { IconCircleCaretUp, IconCross } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function InstallPrompt() {
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [openModal, setOpenModal] = useState(isStandalone);

    useEffect(() => {
        setIsIOS(
            /iPad|iPhone|iPod/.test(navigator.userAgent) &&
                !("MSStream" in window)
        );

        setIsStandalone(
            window.matchMedia("(display-mode: standalone)").matches
        );
    }, []);

    if (isStandalone) {
        return null; // Don't show install button if already installed
    }

    return (
        <Modal
            opened={openModal}
            onClose={() => setOpenModal(false)}
            withinPortal={false}
        >
            <Stack>
                <Title order={3}>Install App</Title>
                <Button>Add to Home Screen</Button>
                {isIOS && (
                    <Text>
                        To install this app on your iOS device, tap the share
                        button
                        <IconCircleCaretUp />
                        and then Add to Home Screen
                        <IconCross />.
                    </Text>
                )}
            </Stack>
        </Modal>
    );
}
