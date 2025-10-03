"use client";

import { subscribeToPush, unsubscribeFromPush } from "@/lib/actions/pwa";
import { useCallback, useEffect, useState } from "react";

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isPending, setIsPending] = useState(false); // data in transition
    const [isFetching, setIsFetching] = useState(true); // initial data load

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            "serviceWorker" in navigator &&
            "PushManager" in window
        ) {
            setIsSupported(true);
            checkSubscription();
        } else {
            setIsSupported(false);
            setIsFetching(false);
        }
    }, []);

    const checkSubscription = async () => {
        try {
            setIsFetching(true);
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);

            if (sub) {
                setIsSubscribed(true);
            }
        } catch (err) {
            console.error("Error checking subscription:", err);
            setError("Failed to check subscription status");
        } finally {
            setIsFetching(false);
        }
    };

    const subscribe = useCallback(async () => {
        try {
            setIsPending(true);
            setError(null);

            // Request notification permission
            const permission = await Notification.requestPermission();

            if (permission !== "granted") {
                throw new Error("Notification permission denied");
            }

            // Get service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Subscribe to push notifications
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(
                    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
                ),
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
                throw new Error(result?.serverError || "Failed to subscribe");
            }
        } catch (err) {
            console.error("Error subscribing to push notifications:", err);
            setError("Failed to subscribe to notifications");
        } finally {
            setIsPending(false);
        }
    }, []);

    const unsubscribe = useCallback(async () => {
        try {
            setIsPending(true);
            setError(null);

            if (!subscription) {
                throw new Error("No active subscription");
            }

            // Unsubscribe from push notifications
            await subscription.unsubscribe();

            // Remove subscription from server
            const result = await unsubscribeFromPush({
                endpoint: subscription.endpoint,
            });

            if (result?.data?.success) {
                setSubscription(null);
                setIsSubscribed(false);
            } else {
                throw new Error(result?.serverError || "Failed to unsubscribe");
            }
        } catch (err) {
            console.error("Error unsubscribing from push notifications:", err);
            setError("Failed to unsubscribe from notifications");
        } finally {
            setIsPending(false);
        }
    }, [subscription]);

    return {
        isSupported,
        isSubscribed,
        isPending,
        error,
        subscribe,
        unsubscribe,
        isFetching,
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
    for (let i = 0; i < rawData.length; ++i) {
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
