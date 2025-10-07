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
 */
export function useExitOnHomePage() {
    const lastBackPress = useRef<number>(0);

    useEffect(() => {
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            navigator.standalone === true;

        // Make home page the root of history
        window.history.replaceState(null, "", window.location.pathname);
        window.history.pushState(null, "", window.location.pathname);

        const handlePopState = () => {
            if (window.location.pathname === "/") {
                const now = Date.now();
                const diff = now - lastBackPress.current;

                if (diff < 2000) {
                    if (isStandalone) {
                        window.close(); // Exits only in standalone PWA
                    } else {
                        window.history.go(-2); // Browser fallback
                    }
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
