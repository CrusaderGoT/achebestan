"use client";

import { showNotification } from "@mantine/notifications";
import { useEffect, useRef } from "react";

declare global {
    interface Navigator {
        standalone?: boolean; // iOS Safari PWA flag
    }
}

/**
 * Handles Android-like back-to-exit behavior on the home page.
 *
 * - When on "/", pressing back once shows a warning.
 * - Pressing back again within 2s exits (if PWA) or navigates away.
 */
export function useBackToExitAtHome() {
    const lastBackPress = useRef<number>(0);

    useEffect(() => {
        const isPWA =
            window.matchMedia("(display-mode: standalone)").matches ||
            window.navigator.standalone === true;

        // Ensure current page is root in history
        window.history.replaceState(null, "", window.location.pathname);
        window.history.pushState(null, "", window.location.pathname);

        const handlePopState = () => {
            if (window.location.pathname === "/") {
                const now = Date.now();
                const diff = now - lastBackPress.current;

                if (diff < 2000) {
                    // Pressed twice quickly → exit (if PWA)
                    if (isPWA) {
                        window.close(); // Works in standalone mode
                    } else {
                        // In browser mode, go back or exit tab
                        window.history.go(-2);
                    }
                } else {
                    // First back press → show warning
                    showNotification({
                        message: "Press back again to exit the app",
                        color: "yellow",
                        autoClose: 2000,
                        radius: "md",
                    });

                    lastBackPress.current = now;
                    // Push same state again to prevent immediate exit
                    window.history.pushState(
                        null,
                        "",
                        window.location.pathname
                    );
                }
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);
}
