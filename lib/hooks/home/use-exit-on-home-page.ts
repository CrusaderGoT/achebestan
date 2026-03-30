"use client";

import { showNotification } from "@mantine/notifications";
import { useEffect, useRef } from "react";

declare global {
    interface Navigator {
        standalone?: boolean; // iOS Safari PWA flag
    }
}

/**
 * Handles Android-like back-to-exit behavior on the home page in PWA mode only.
 */
export function useExitOnHomePage() {
    const lastBackPress = useRef<number>(0);
    const isStandaloneRef = useRef<boolean>(false);

    useEffect(() => {
        // Check if running as PWA (standalone mode)
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            navigator.standalone === true ||
            // Additional Android PWA check
            document.referrer.includes("android-app://");

        isStandaloneRef.current = isStandalone;

        // Only activate this behavior in standalone PWA mode
        if (!isStandalone) {
            return;
        }

        // Store initial pathname to check if we're on home page
        const homePath = window.location.pathname;

        const handlePopState = () => {
            // Only handle back button on the home page
            if (window.location.pathname !== homePath) {
                return;
            }

            const now = Date.now();
            const diff = now - lastBackPress.current;

            if (diff < 2000) {
                // Second back press within 2 seconds → exit app
                window.close();
            } else {
                // First back press → show warning
                showNotification({
                    message: "Press back again to exit the app",
                    color: "yellow",
                    autoClose: 2000,
                    radius: "md",
                    position: "bottom-center",
                });

                lastBackPress.current = now;

                // Push a dummy state to catch the next back press
                window.history.pushState({ exitWarning: true }, "", homePath);
            }
        };

        // Initialize history with a dummy state
        window.history.pushState({ exitWarning: true }, "", homePath);

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);
}
