// components/RouteNavigationProgress.tsx
"use client";

import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// Shared state to coordinate between components
const navigationState = {
    isNavigating: false,
    startTime: 0,
    progressTimer: null as NodeJS.Timeout | null,
    completeTimer: null as NodeJS.Timeout | null,
};

function startNavigation() {
    // Clear any existing timers
    if (navigationState.progressTimer) {
        clearTimeout(navigationState.progressTimer);
    }
    if (navigationState.completeTimer) {
        clearTimeout(navigationState.completeTimer);
    }

    navigationState.isNavigating = true;
    navigationState.startTime = Date.now();

    nprogress.start();

    // Increment progress gradually for better UX
    navigationState.progressTimer = setTimeout(() => {
        if (navigationState.isNavigating) {
            nprogress.set(50);
        }
    }, 200);
}

function completeNavigation() {
    const elapsed = Date.now() - navigationState.startTime;
    const minDuration = 300; // Minimum duration for smooth animation

    // Clear progress timer
    if (navigationState.progressTimer) {
        clearTimeout(navigationState.progressTimer);
        navigationState.progressTimer = null;
    }

    const complete = () => {
        nprogress.complete();
        navigationState.isNavigating = false;
        navigationState.completeTimer = null;
    };

    // If navigation was too fast, delay completion for smooth effect
    if (elapsed < minDuration) {
        navigationState.completeTimer = setTimeout(
            complete,
            minDuration - elapsed
        );
    } else {
        complete();
    }
}

export function RouteNavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isInitial = useRef(true);
    const prevRoute = useRef({ pathname, search: searchParams.toString() });

    useEffect(() => {
        const currentRoute = { pathname, search: searchParams.toString() };

        // Skip initial render
        if (isInitial.current) {
            isInitial.current = false;
            prevRoute.current = currentRoute;
            return;
        }

        // Check if route actually changed
        const routeChanged =
            prevRoute.current.pathname !== currentRoute.pathname ||
            prevRoute.current.search !== currentRoute.search;

        if (routeChanged) {
            prevRoute.current = currentRoute;

            // If not already navigating (e.g., browser back/forward), start progress
            if (!navigationState.isNavigating) {
                startNavigation();
            }

            // Complete the navigation
            completeNavigation();
        }
    }, [pathname, searchParams]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (navigationState.progressTimer) {
                clearTimeout(navigationState.progressTimer);
            }
            if (navigationState.completeTimer) {
                clearTimeout(navigationState.completeTimer);
            }
        };
    }, []);

    return <NavigationProgress color="cyan" />;
}

// components/NavigationLink.tsx

import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes, MouseEvent } from "react";

interface NavigationLinkProps extends LinkProps {
    children: React.ReactNode;
    className?: string;
    target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
    rel?: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function NavigationLink({
    children,
    onClick,
    href,
    target,
    ...props
}: NavigationLinkProps) {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        // Don't start progress for:
        // - External links
        // - Links with target="_blank"
        // - Links that are prevented by onClick
        const isExternal =
            typeof href === "string" &&
            (href.startsWith("http://") ||
                href.startsWith("https://") ||
                href.startsWith("//"));

        const hasTargetBlank = target === "_blank";

        if (!isExternal && !hasTargetBlank) {
            startNavigation();
        }

        onClick?.(e);
    };

    return (
        <Link {...props} href={href} target={target} onClick={handleClick}>
            {children}
        </Link>
    );
}
