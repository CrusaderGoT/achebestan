// RouteNavigationProgress.tsx
"use client";

import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { usePathname, useSearchParams } from "next/navigation";
import { ComponentPropsWithRef, useEffect, useRef } from "react";

import Link from "next/link";

export function RouteNavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isInitialLoad = useRef(true);

    // Handle route changes
    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }

        nprogress.start();

        const timer = setTimeout(() => {
            nprogress.complete();
        }, 200);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    // Handle link clicks globally
    useEffect(() => {
        if (typeof document === "undefined") return;

        const handleLinkClick = (e: Event) => {
            const target = e.target as HTMLElement;
            const link = target.closest("a");

            if (
                link &&
                link.href &&
                !link.href.startsWith("#") &&
                !link.hasAttribute("download") &&
                link.target !== "_blank" &&
                link.href.startsWith(window.location.origin)
            ) {
                // Internal navigation link clicked
                nprogress.start();
            }
        };

        document.addEventListener("click", handleLinkClick);
        return () => document.removeEventListener("click", handleLinkClick);
    }, []);

    return <NavigationProgress />;
}

// NavigationLink.tsx - Custom Link component with progress
interface NavigationLinkProps extends ComponentPropsWithRef<typeof Link> {
    children: React.ReactNode;
}

export function NavigationLink({
    children,
    onClick,
    ...props
}: NavigationLinkProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Start progress on link click
        nprogress.start();

        // Call original onClick if provided
        onClick?.(e);
    };

    return (
        <Link {...props} onClick={handleClick}>
            {children}
        </Link>
    );
}
