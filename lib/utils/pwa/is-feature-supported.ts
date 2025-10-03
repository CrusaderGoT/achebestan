// Abstracted feature checker — reusable: pass the features you want to verify

type PwaFeature =
    | "serviceWorker"
    | "pushManager"
    | "notifications"
    | (string & {});

export const isFeatureSupported = (features: PwaFeature[] = []): boolean => {
    if (typeof window === "undefined") return false;
    return features.every((f) => {
        switch (f) {
            case f:
                return f in navigator;
            default:
                return false;
        }
    });
};
