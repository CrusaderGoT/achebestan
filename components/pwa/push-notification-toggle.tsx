

import { usePushNotifications } from "@/lib/hooks/pwa/use-push-notifications";
import { Alert, Button, Group, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconBell, IconBellOff } from "@tabler/icons-react";

interface PushNotificationToggleProps {
  userExists: boolean;
}

export function PushNotificationToggle({ userExists }: PushNotificationToggleProps) {
  const {
    isSubscribed,
    isSupported,
    isPending,
    isFetching,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  // Don't render if not supported, user doesn't exist, or still loading
  if (!isSupported || !userExists || isFetching) {
    return null;
  }

  return (
    <Stack gap="md">
      {isSubscribed ? (
        <Button
          fullWidth
          size="md"
          onClick={unsubscribe}
          loading={isPending}
          disabled={isPending}
          variant="outline"
          color="red"
          leftSection={<IconBellOff size={16} />}
          aria-label="Disable push notifications"
        >
          Disable Notifications
        </Button>
      ) : (
        <>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text size="lg" fw={500}>
                Subscribe to Notifications
              </Text>
              <Text size="sm" c="dimmed">
                Get notified when new content is published
              </Text>
            </Stack>

            <IconBell size={24} style={{ flexShrink: 0 }} aria-hidden="true" />
          </Group>

          <Button
            fullWidth
            size="md"
            onClick={subscribe}
            loading={isPending}
            disabled={isPending}
            variant="filled"
            color="green"
            leftSection={<IconBell size={16} />}
            aria-label="Enable push notifications"
          >
            Enable Notifications
          </Button>
        </>
      )}

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error"
          color="red"
          variant="light"
        >
          {error.message}
        </Alert>
      )}
    </Stack>
  );
}