

// hooks/useServiceWorker.ts
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useServiceWorker() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [registration, setRegistration] =
        useState<ServiceWorkerRegistration | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            // Register service worker
            navigator.serviceWorker
                .register("/sw.js")
                .then((reg) => {
                    setRegistration(reg);
                    console.log("[Client] Service Worker registered");

                    // Check for updates every hour
                    setInterval(() => {
                        reg.update();
                    }, 60 * 60 * 1000);

                    // Listen for updates
                    reg.addEventListener("updatefound", () => {
                        const newWorker = reg.installing;

                        if (newWorker) {
                            newWorker.addEventListener("statechange", () => {
                                if (
                                    newWorker.state === "installed" &&
                                    navigator.serviceWorker.controller
                                ) {
                                    setUpdateAvailable(true);
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error(
                        "[Client] Service Worker registration failed:",
                        error
                    );
                });

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener("message", (event) => {
                if (event.data.type === "STORY_SYNCED") {
                    console.log("[Client] Story synced:", event.data.url);
                    // You can show a toast notification here
                    // Or trigger a data refetch
                }
            });

            // Listen for controller change (new SW activated)
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                // Reload the page when new SW takes control
                window.location.reload();
            });
        }
    }, [router]);

    const updateServiceWorker = () => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
    };

    return {
        updateAvailable,
        updateServiceWorker,
        registration,
    };
}
