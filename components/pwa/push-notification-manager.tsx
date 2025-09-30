// Push Notificstion ofor PWA

import { sendNotification, subscribeUser, unsubscribeUser } from "@/lib/actions/pwa";
import { Box, Button, Stack, Text, TextInput, Title } from "@mantine/core";
import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false);

    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    );

    const [message, setMessage] = useState("");

    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            setIsSupported(true);
            registerServiceWorker();
        }
    }, []);

    async function registerServiceWorker() {
        const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none",
        });

        const sub = await registration.pushManager.getSubscription();

        setSubscription(sub);
    }

    async function subscribeToPush() {
        const registration = await navigator.serviceWorker.ready;

        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string
            ),
        });

        setSubscription(sub);

        const serializedSub = JSON.parse(JSON.stringify(sub));

        await subscribeUser(serializedSub);
    }

    async function unsubscribeFromPush() {
        await subscription?.unsubscribe();

        setSubscription(null);

        await unsubscribeUser();
    }

    async function sendTestNotification() {
        if (subscription) {
            await sendNotification(message);
            setMessage("");
        }
    }

    if (!isSupported) {
        return (
            <Text>Push notifications are not supported in this browser.</Text>
        );
    }

    return (
        <Box>
            <Title>Push Notification</Title>

            {subscription ? (
                <Stack>
                    <Text>You are subscribed to push notifications</Text>

                    <Button onClick={unsubscribeFromPush}>Unsubscribe</Button>

                    <TextInput
                        type="text"
                        placeholder="Enter notification message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <Button onClick={sendTestNotification}>Send Test</Button>
                </Stack>
            ) : (
                <Stack>
                    <Text>You are not subscribed to push notifications.</Text>

                    <Button onClick={subscribeToPush}>Subscribe</Button>
                </Stack>
            )}
        </Box>
    );
}
