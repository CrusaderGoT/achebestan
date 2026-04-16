// components/OfflineIndicator.tsx
"use client";

import { ActionIcon, Tooltip, Transition } from "@mantine/core";
import { IconWifi, IconWifiOff } from "@tabler/icons-react";
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
            {/* Keyframes for the attention-grabbing pulse on the offline state.
                Scoped inside the component so there are no global style leaks. */}
            <style>{`
                @keyframes ob-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(250, 82, 82, 0.55); }
                    50%       { box-shadow: 0 0 0 8px rgba(250, 82, 82, 0); }
                }
                @keyframes ob-pop-in {
                    0%   { transform: scale(0.6); opacity: 0; }
                    70%  { transform: scale(1.12); }
                    100% { transform: scale(1);   opacity: 1; }
                }
                .ob-pulse  { animation: ob-pulse 1.8s ease-in-out infinite; }
                .ob-pop-in { animation: ob-pop-in 0.28s cubic-bezier(.34,1.56,.64,1) both; }
            `}</style>

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
                        w={200}
                        withArrow
                        arrowSize={8}
                        position="top-end"
                        // Touch + hover so it works naturally on both mobile and desktop
                        events={{ hover: true, touch: true, focus: true }}
                        transitionProps={{ transition: "pop", duration: 180 }}
                    >
                        <ActionIcon
                            className={`ob-pop-in ${isOffline ? "ob-pulse" : ""}`}
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
