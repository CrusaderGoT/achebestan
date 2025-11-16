"use client";

import { subscribeToPush, unsubscribeFromPush } from "@/lib/actions/pwa";
import { isFeatureSupported } from "@/lib/utils/pwa/is-feature-supported";
import { useCallback, useEffect, useState } from "react";

type NotificationError = {
    message: string;
    code?: string;
};

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<NotificationError | null>(null);

    const checkSubscription = useCallback(async () => {
        try {
            setIsFetching(true);
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();

            setSubscription(sub);
            setIsSubscribed(!!sub);
        } catch (err) {
            console.error("Error checking subscription:", err);
            setError({
                message: "Failed to check subscription status",
                code: "CHECK_FAILED",
            });
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        const supported = isFeatureSupported(["serviceWorker", "pushManager"]);
        setIsSupported(supported);

        if (supported) {
            checkSubscription();
        } else {
            setIsFetching(false);
        }
    }, [checkSubscription]);

    const subscribe = useCallback(async () => {
        try {
            setIsPending(true);
            setError(null);

            // Check if notification permission is already denied
            if (Notification.permission === "denied") {
                throw new Error(
                    "Notification permission was previously denied. Please enable it in your browser settings."
                );
            }

            // Request notification permission
            const permission = await Notification.requestPermission();

            if (permission !== "granted") {
                throw new Error(
                    "Notification permission is required to subscribe"
                );
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!publicKey) {
                throw new Error("VAPID public key is not configured");
            }

            // Subscribe to push notifications
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            // Send subscription to server
            const result = await subscribeToPush({
                endpoint: sub.endpoint,
                keys: {
                    p256dh: arrayBufferToBase64(sub.getKey("p256dh")),
                    auth: arrayBufferToBase64(sub.getKey("auth")),
                },
            });

            if (result?.data?.success) {
                setSubscription(sub);
                setIsSubscribed(true);
            } else {
                // Unsubscribe locally if server registration failed
                await sub.unsubscribe();
                throw new Error(
                    result?.serverError ||
                        "Failed to register subscription with server"
                );
            }
        } catch (err) {
            console.log("Error subscribing to push notifications:", err);
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to subscribe to notifications";
            setError({ message, code: "SUBSCRIBE_FAILED" });
        } finally {
            setIsPending(false);
        }
    }, []);

    const unsubscribe = useCallback(async () => {
        try {
            setIsPending(true);
            setError(null);

            if (!subscription) {
                throw new Error("No active subscription found");
            }

            // Remove subscription from server first
            const result = await unsubscribeFromPush({
                endpoint: subscription.endpoint,
            });

            // Unsubscribe locally even if server removal fails (cleanup)
            await subscription.unsubscribe();

            if (
                result?.data?.success ||
                result?.serverError?.includes("not found")
            ) {
                setSubscription(null);
                setIsSubscribed(false);
            } else {
                throw new Error(
                    result?.serverError ||
                        "Failed to remove subscription from server"
                );
            }
        } catch (err) {
            console.error("Error unsubscribing from push notifications:", err);
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to unsubscribe from notifications";
            setError({ message, code: "UNSUBSCRIBE_FAILED" });
        } finally {
            setIsPending(false);
        }
    }, [subscription]);

    return {
        isSupported,
        isSubscribed,
        isPending,
        isFetching,
        error,
        subscribe,
        unsubscribe,
    };
}

// Helper functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return "";

    const bytes = new Uint8Array(buffer);
    let binary = "";

    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
}
