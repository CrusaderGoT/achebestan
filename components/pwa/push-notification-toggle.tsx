"use client";

import { usePushNotifications } from "@/lib/hooks/pwa/use-push-notifications";
import { Alert, Button, Group, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconBell, IconBellOff } from "@tabler/icons-react";

export function PushNotificationToggle({
    userExists,
}: {
    userExists: boolean;
}) {
    const {
        isSubscribed,
        isSupported,
        isPending,
        isFetching,
        error,
        subscribe,
        unsubscribe,
    } = usePushNotifications();

    if (!isSupported || !userExists || isFetching) {
        return null;
    }

    return (
        <>
            {isSubscribed ? (
                <Button
                    fullWidth
                    size="md"
                    onClick={unsubscribe}
                    loading={isPending}
                    variant={"outline"}
                    color={"red"}
                    leftSection={<IconBellOff size={16} />}
                >
                    Disable Notifications
                </Button>
            ) : (
                <Stack>
                    <Group justify="space-between" align="center">
                        <Stack>
                            <Text size="lg" fw={500}>
                                Subcribe To Notifications
                            </Text>
                            <Text size="sm" c="dimmed">
                                Get notified when new content is published
                            </Text>
                        </Stack>

                        <IconBell size={16} />
                    </Group>

                    <Button
                        fullWidth
                        onClick={subscribe}
                        loading={isPending}
                        variant={"filled"}
                        color={"green"}
                        leftSection={<IconBell size={16} />}
                    >
                        Enable Notifications
                    </Button>
                </Stack>
            )}

            {error && (
                <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Error"
                    color="red"
                >
                    {error}
                </Alert>
            )}
        </>
    );
}
