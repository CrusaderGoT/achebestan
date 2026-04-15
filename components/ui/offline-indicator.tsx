// components/OfflineIndicator.tsx
"use client";

import { Dialog } from "@mantine/core";
import { useEffect, useState } from "react";

export function OfflineIndicators() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <Dialog opened={!isOnline} size={"xs"}>
            ⚠️ You&apos;re currently offline. Some features may be limited.
        </Dialog>
    );
}
