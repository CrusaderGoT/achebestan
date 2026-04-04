// components/RouteNavigationProgress.tsx
"use client";

import { NavigationProgress, nprogress } from "@mantine/nprogress";
import Link, { LinkProps } from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    AnchorHTMLAttributes,
    MouseEvent,
    ReactNode,
    useEffect,
    useMemo,
    useRef,
    useTransition,
} from "react";

// ─── Module-level progress orchestration ──────────────────────────────────────
//
// Using module-level state is intentional: the progress bar is a singleton UI
// element and all navigation interactions target the same instance.
//
// Why NOT put this in React state / context?
//   • State updates are asynchronous — we'd lose the ability to start/stop the
//     bar synchronously in event handlers, causing visible flickers.
//   • Module scope means NavigationLink instances across the tree can all reach
//     the same bar without prop-drilling or a Provider.

/** After STALL_MS the bar parks at 85% to signal "this is taking a while". */
const STALL_MS = 3_000;

/**
 * After ABANDON_MS with no completion (e.g. navigation never resolves or the
 * popstate was a false alarm like pressing back on the very first history entry)
 * the bar resets entirely so it doesn't hang on-screen forever.
 */
const ABANDON_MS = 12_000;

let _running = false;
let _stallTimer: ReturnType<typeof setTimeout> | null = null;
let _abandonTimer: ReturnType<typeof setTimeout> | null = null;

function _clearTimers() {
    if (_stallTimer) {
        clearTimeout(_stallTimer);
        _stallTimer = null;
    }
    if (_abandonTimer) {
        clearTimeout(_abandonTimer);
        _abandonTimer = null;
    }
}

/**
 * Start (or restart) the navigation progress bar.
 * Safe to call multiple times — each call resets and restarts cleanly.
 * Exported so you can call it alongside `router.push()` in non-Link contexts.
 */
export function startNavProgress() {
    _clearTimers();
    _running = true;

    // Reset first so a mid-flight bar snaps back to 0 before restarting,
    // instead of animating backwards.
    nprogress.reset();
    nprogress.start();

    // After STALL_MS, park at 85%.  This tells the user "still loading" without
    // implying the navigation is done.  The bar will stay here until either
    // completeNavProgress() is called or ABANDON_MS elapses.
    _stallTimer = setTimeout(() => {
        if (_running) nprogress.set(85);
    }, STALL_MS);

    // Safety valve: if nothing ever calls complete (e.g. popstate on the first
    // history entry, or a middleware redirect to an external URL), reset so the
    // bar doesn't hang on-screen indefinitely.
    _abandonTimer = setTimeout(() => {
        if (_running) {
            _running = false;
            nprogress.reset();
        }
    }, ABANDON_MS);
}

/**
 * Complete and hide the navigation progress bar.
 * Idempotent — safe to call even if the bar isn't currently running.
 * Exported so you can call it after awaiting `router.push()` in non-Link contexts.
 */
export function completeNavProgress() {
    if (!_running) return;
    _running = false;
    _clearTimers();
    nprogress.complete();
}

// ─── RouteNavigationProgress ──────────────────────────────────────────────────
//
// Mount this once in your root layout, inside MantineProvider.
//
// ⚠️  This component calls useSearchParams(), which requires a <Suspense>
//     boundary somewhere above it in the tree.  The recommended pattern is to
//     wrap it in Suspense at the layout level:
//
//       <Suspense fallback={null}>
//         <RouteNavigationProgress />
//       </Suspense>

export function RouteNavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Stringify once per render so effects get a stable primitive dependency
    // instead of comparing object references.
    const searchStr = useMemo(() => searchParams.toString(), [searchParams]);

    const prevRouteRef = useRef<string | null>(null);
    const isInitialRef = useRef(true);

    // ── Complete the bar whenever the actual route changes ──────────────────
    //
    // This is the authoritative "navigation finished" signal.  It covers:
    //   • NavigationLink navigations (isPending → false also completes, but this
    //     is a backstop in case useEffect timing differs between renders)
    //   • Browser back/forward button (started via popstate, completed here)
    //   • Programmatic router.push() called outside of NavigationLink
    //
    // We deliberately exclude the very first render so that arriving at a page
    // for the first time doesn't flash-complete a bar that was never started.
    useEffect(() => {
        const current = `${pathname}?${searchStr}`;

        if (isInitialRef.current) {
            isInitialRef.current = false;
            prevRouteRef.current = current;
            return;
        }

        if (prevRouteRef.current !== current) {
            prevRouteRef.current = current;
            completeNavProgress();
        }
    }, [pathname, searchStr]);

    // ── Start the bar on browser back/forward button presses ────────────────
    //
    // The App Router doesn't expose routeChangeStart events, so popstate is the
    // only hook we have for browser-initiated navigation.  Completion is handled
    // by the effect above when pathname/searchStr changes.
    //
    // Edge case: pressing back on the very first history entry fires popstate
    // but navigation never happens (browser shows "press back again to exit").
    // The ABANDON_MS timer will reset the bar after 12 s in that case.
    useEffect(() => {
        const onPopState = () => startNavProgress();
        window.addEventListener("popstate", onPopState);

        return () => {
            window.removeEventListener("popstate", onPopState);
            // Clean up any in-flight timers when the component unmounts.
            _clearTimers();
        };
    }, []);

    return <NavigationProgress color="cyan" />;
}

// ─── NavigationLink ───────────────────────────────────────────────────────────
//
// Drop-in replacement for Next.js <Link> that drives the progress bar.
//
// Key design decisions:
//
//   1. Same-page guard — does NOT start progress when href resolves to the
//      current pathname + search params.  This was the root cause of the
//      progress appearing on the home page and the phantom "press back to exit"
//      mobile prompt.
//
//   2. startTransition — navigation is wrapped in React's startTransition so
//      that isPending tracks the full server-render-and-commit lifecycle.
//      isPending → false is the most accurate "navigation done" signal available
//      in the App Router (there are no router events in next/navigation).
//
//   3. e.preventDefault() + router.push — we intercept the click to control the
//      startTransition wrapper.  <Link> still handles prefetching on
//      hover/visibility as normal; only the actual navigation is overridden.
//
//   4. External / new-tab links — forwarded to the browser unchanged.
//
//   5. Hash-only links — forwarded unchanged (instant, no loading needed).
//
// ⚠️  This component calls useSearchParams() for the same-page check.
//     Wrap it (or a parent) in <Suspense> as noted above.

interface NavigationLinkProps extends LinkProps {
    children: ReactNode;
    className?: string;
    target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
    rel?: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

/** Convert a Next.js href (string | UrlObject) to a plain string. */
function hrefToString(href: LinkProps["href"]): string {
    if (typeof href === "string") return href;
    const { pathname = "/", search = "", hash = "" } = href;
    return `${pathname}${search}${hash}`;
}

export function NavigationLink({
    children,
    onClick,
    href,
    target,
    replace,
    scroll,
    ...props
}: NavigationLinkProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const searchStr = useMemo(() => searchParams.toString(), [searchParams]);

    const [isPending, startTrans] = useTransition();

    // Track whether *this* NavigationLink instance started the current
    // progress so we don't complete a bar that another instance started.
    const didStartRef = useRef(false);

    // ── Complete the bar when useTransition finishes ─────────────────────────
    //
    // isPending goes false only after React has committed all state updates from
    // the transition — meaning the new page is fully rendered.  This is more
    // precise than the route-change effect in RouteNavigationProgress (which
    // is a fallback / belt-and-suspenders).
    useEffect(() => {
        if (!isPending && didStartRef.current) {
            didStartRef.current = false;
            completeNavProgress();
        }
    }, [isPending]);

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        // Call any external onClick first; respect e.preventDefault() from it.
        onClick?.(e);
        if (e.defaultPrevented) return;

        const hrefStr = hrefToString(href);

        // Hash-only anchors navigate within the page — no loading needed.
        if (hrefStr.startsWith("#")) return;

        // External links and new-tab links: let the browser handle them.
        const isExternal = /^(https?:)?\/\//.test(hrefStr);
        if (isExternal || target === "_blank") return;

        // Parse the destination URL to extract pathname and search.
        let destPathname: string;
        let destSearch: string;
        try {
            // Use a dummy base so relative paths like "/about" parse correctly.
            const url = new URL(hrefStr, "http://n");
            destPathname = url.pathname;
            destSearch = url.search.slice(1); // strip the leading "?"
        } catch {
            // Unparseable href — let Next's <Link> handle it as-is.
            return;
        }

        // ── Same-page guard ──────────────────────────────────────────────────
        // If the user is already on the destination (same pathname AND same
        // query string, hash differences are irrelevant for loading state),
        // do NOT intercept or start progress.
        //
        // This was the cause of:
        //   • Progress bar appearing / hanging on the home page.
        //   • "Press back again to exit" prompt on mobile (the bar started but
        //     the route never changed, leaving nprogress in a running state).
        const isSamePage =
            destPathname === pathname && destSearch === searchStr;
        if (isSamePage) return;

        // Intercept the click so we can wrap navigation in startTransition.
        // <Link>'s prefetch (hover/visibility) is unaffected by this.
        e.preventDefault();

        didStartRef.current = true;
        startNavProgress();

        startTrans(() => {
            const opts =
                scroll === false ? { scroll: false as const } : undefined;
            if (replace) {
                router.replace(hrefStr, opts);
            } else {
                router.push(hrefStr, opts);
            }
        });
    };

    return (
        <Link
            {...props}
            href={href}
            target={target}
            replace={replace}
            scroll={scroll}
            onClick={handleClick}
        >
            {children}
        </Link>
    );
}
