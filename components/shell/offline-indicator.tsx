// components/OfflineIndicator.tsx
"use client";

import styles from "@/styles/shell/offline.module.css";
import { ActionIcon, Tooltip, Transition } from "@mantine/core";
import { IconWifi, IconWifiOff } from "@tabler/icons-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

// Three distinct states so we can show a brief "back online" confirmation
// before the indicator disappears entirely — avoids silent/abrupt removal.
type ConnectionStatus = "online" | "offline" | "reconnected";

const RECONNECTED_LINGER_MS = 2500;

export function OfflineIndicator() {
    const [status, setStatus] = useState<ConnectionStatus>("online");

    useEffect(() => {
        // Immediately reflect the real browser state on mount — avoids a flash
        // of "online" when the component mounts while actually offline (e.g. SSR
        // hydration lag or page load on a captive portal).
        if (!navigator.onLine) setStatus("offline");

        let lingerTimer: ReturnType<typeof setTimeout>;

        const handleOnline = () => {
            clearTimeout(lingerTimer);
            setStatus("reconnected");
            // Let the "back online" indicator breathe before it leaves
            lingerTimer = setTimeout(
                () => setStatus("online"),
                RECONNECTED_LINGER_MS,
            );
        };

        const handleOffline = () => {
            clearTimeout(lingerTimer);
            setStatus("offline");
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            clearTimeout(lingerTimer);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const isOffline = status === "offline";
    const isReconnected = status === "reconnected";
    const isVisible = isOffline || isReconnected;

    const tooltipLabel = isOffline
        ? "You're offline — some features may be limited."
        : "You're back online. Everything should work normally.";

    const iconColor = isOffline ? "red" : "teal";

    return (
        <>
            <Transition
                mounted={isVisible}
                transition="slide-up"
                duration={280}
                timingFunction="cubic-bezier(.34,1.56,.64,1)"
            >
                {(transitionStyles) => (
                    <Tooltip
                        label={tooltipLabel}
                        multiline
                        maw={200}
                        withArrow
                        arrowSize={8}
                        position="top-end"
                        // Touch + hover so it works naturally on both mobile and desktop
                        events={{ hover: true, touch: true, focus: true }}
                        transitionProps={{ transition: "pop", duration: 180 }}
                    >
                        <ActionIcon
                            className={clsx(
                                styles.obPopIn,
                                isOffline && styles.obPulse,
                            )}
                            style={{
                                ...transitionStyles,
                                position: "fixed",
                                bottom: 24,
                                right: 24,
                                zIndex: 9999,
                            }}
                            size={42}
                            radius="xl"
                            color={iconColor}
                            variant="filled"
                            aria-label={
                                isOffline
                                    ? "Network status: offline"
                                    : "Network status: reconnected"
                            }
                            aria-live="polite"
                        >
                            {isOffline ? (
                                <IconWifiOff size={20} stroke={1.8} />
                            ) : (
                                <IconWifi size={20} stroke={1.8} />
                            )}
                        </ActionIcon>
                    </Tooltip>
                )}
            </Transition>
        </>
    );
}
