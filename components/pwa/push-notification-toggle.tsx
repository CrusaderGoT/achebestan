"use client";

import { usePushNotifications } from "@/lib/hooks/pwa/use-push-notifications";
import { Alert, Button, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconBell, IconBellOff } from "@tabler/icons-react";

export function PushNotificationToggle() {
    const {
        isSupported,
        isSubscribed,
        isLoading,
        error,
        subscribe,
        unsubscribe,
    } = usePushNotifications();

    if (!isSupported) {
        return (
            <Alert
                icon={<IconAlertCircle size={16} />}
                title="Not Supported"
                color="yellow"
            >
                Push notifications are not supported in your browser.
            </Alert>
        );
    }

    return (
        <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
                <Group justify="space-between">
                    <div>
                        <Text size="lg" fw={500}>
                            Push Notifications
                        </Text>
                        <Text size="sm" c="dimmed">
                            Get notified when new content is published
                        </Text>
                    </div>
                    {isLoading ? (
                        <Loader size="sm" />
                    ) : isSubscribed ? (
                        <IconBell size={24} />
                    ) : (
                        <IconBellOff size={24} />
                    )}
                </Group>

                {error && (
                    <Alert
                        icon={<IconAlertCircle size={16} />}
                        title="Error"
                        color="red"
                    >
                        {error}
                    </Alert>
                )}

                <Button
                    fullWidth
                    onClick={isSubscribed ? unsubscribe : subscribe}
                    loading={isLoading}
                    variant={isSubscribed ? "outline" : "filled"}
                    color={isSubscribed ? "red" : "blue"}
                    leftSection={
                        isSubscribed ? (
                            <IconBellOff size={16} />
                        ) : (
                            <IconBell size={16} />
                        )
                    }
                >
                    {isSubscribed
                        ? "Disable Notifications"
                        : "Enable Notifications"}
                </Button>

                {isSubscribed && (
                    <Text size="xs" c="dimmed" ta="center">
                        Youll receive notifications for new content
                    </Text>
                )}
            </Stack>
        </Card>
    );
}
