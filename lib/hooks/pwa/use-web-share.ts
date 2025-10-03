"use client";

import { useIsomorphicEffect } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";

export const useWebShare = () => {
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    useIsomorphicEffect(() => {
        if (!navigator.canShare) {
            setIsSupported(false);
        } else {
            setIsSupported(true);
        }
    });

    useEffect(() => {
        if (!error) return;

        notifications.show({
            title: "Share Error",
            message: error,
            autoClose: 5000,
        });

        const timer = setTimeout(() => setError(null), 5000);
        return () => clearTimeout(timer);
    }, [error, setError]);

    const share = useCallback(async (data: ShareData) => {
        // try and share
        try {
            setError(null);
            if (!navigator.canShare(data)) {
                notifications.show({ message: "Cannot Share" });
                return;
            }

            await navigator.share(data);
        } catch (e) {
            console.log("share error", e);
            setError("Error While Sharing");
        }
    }, []);

    return { share, error, isSupported, setError };
};
