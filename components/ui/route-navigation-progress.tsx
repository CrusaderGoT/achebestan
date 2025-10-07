// components/RouteNavigationProgress.tsx
"use client";

import { NavigationProgress, nprogress } from "@mantine/nprogress";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import Link, { LinkProps } from "next/link";
import { MouseEvent } from "react";

export function RouteNavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isInitial = useRef(true);

    useEffect(() => {
        if (isInitial.current) {
            isInitial.current = false;
            return;
        }

        nprogress.start();
        const timer = setTimeout(() => nprogress.complete(), 400);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    return <NavigationProgress color="cyan" />;
}

// components/NavigationLink.tsx

interface NavigationLinkProps extends LinkProps {
    children: React.ReactNode;
    className?: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export function NavigationLink({
    children,
    onClick,
    ...props
}: NavigationLinkProps) {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        nprogress.start();
        onClick?.(e);

        // fallback in case navigation finishes too quickly
        const timer = setTimeout(() => nprogress.complete(), 1000);
        setTimeout(() => clearTimeout(timer), 2000);
    };

    return (
        <Link {...props} onClick={handleClick}>
            {children}
        </Link>
    );
}
