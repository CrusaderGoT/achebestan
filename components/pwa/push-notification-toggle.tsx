"use client";

import { usePushNotifications } from "@/lib/hooks/pwa/use-push-notifications";
import {
    Alert,
    Button,
    Dialog,
    DialogProps,
    Group,
    Stack,
    Text,
} from "@mantine/core";
import { IconAlertCircle, IconBell, IconBellOff } from "@tabler/icons-react";

export function PushNotificationToggle({
    userExists,
    ...props
}: DialogProps & { userExists: boolean }) {
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

    if (isSubscribed) {
        return (
            <Button
                size="md"
                onClick={unsubscribe}
                variant={"outline"}
                color={"red"}
                leftSection={<IconBellOff size={16} />}
            >
                Disable Notifications
            </Button>
        );
    }

    return (
        <Dialog {...props}>
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
                    onClick={subscribe}
                    loading={isPending}
                    variant={"filled"}
                    color={"green"}
                    leftSection={<IconBell size={16} />}
                >
                    Enable Notifications
                </Button>
            </Stack>
        </Dialog>
    );
}
