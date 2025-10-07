/**
 * Checks if specific PWA features are supported in the current browser environment
 */

type PwaFeature =
    | "serviceWorker"
    | "pushManager"
    | "notifications"
    | "storage"
    | "sync"
    | (string & {});

/**
 * Verifies if all specified PWA features are supported
 * @param features - Array of feature names to check
 * @returns true if all features are supported, false otherwise
 */
export const isFeatureSupported = (features: PwaFeature[] = []): boolean => {
    // Server-side check
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return false;
    }

    return features.every((feature) => {
        switch (feature) {
            case "serviceWorker":
                return "serviceWorker" in navigator;

            case "pushManager":
                return "serviceWorker" in navigator && "PushManager" in window;

            case "notifications":
                return "Notification" in window;

            case "storage":
                return "storage" in navigator;

            case "sync":
                return (
                    "serviceWorker" in navigator &&
                    "sync" in ServiceWorkerRegistration.prototype
                );

            default:
                // Generic check for custom features
                return feature in navigator || feature in window;
        }
    });
};

/**
 * Check individual feature support with detailed error messages
 */
export const checkFeatureSupport = (
    feature: PwaFeature
): {
    supported: boolean;
    message?: string;
} => {
    if (typeof window === "undefined") {
        return {
            supported: false,
            message: "Not in browser environment",
        };
    }

    switch (feature) {
        case "serviceWorker":
            return {
                supported: "serviceWorker" in navigator,
                message:
                    "serviceWorker" in navigator
                        ? undefined
                        : "Service Workers are not supported in this browser",
            };

        case "pushManager":
            return {
                supported:
                    "serviceWorker" in navigator && "PushManager" in window,
                message:
                    "serviceWorker" in navigator && "PushManager" in window
                        ? undefined
                        : "Push notifications are not supported in this browser",
            };

        case "notifications":
            return {
                supported: "Notification" in window,
                message:
                    "Notification" in window
                        ? undefined
                        : "Notifications API is not supported in this browser",
            };

        default:
            const supported = feature in navigator || feature in window;
            return {
                supported,
                message: supported
                    ? undefined
                    : `Feature '${feature}' is not supported`,
            };
    }
};
