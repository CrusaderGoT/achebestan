"use client";

import { TableOfContents } from "@mantine/core";
import {
    RefObject,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

export function StoryTableOfContents({
    dependency,
    scrollAreaRef,
}: {
    dependency: string;
    scrollAreaRef?: RefObject<HTMLDivElement | null>;
}) {
    const reinitializeRef = useRef(() => {});
    const [viewport, setViewport] = useState<HTMLElement | null>(null);
    const [isReady, setIsReady] = useState(false);

    const findScrollableViewport = useCallback(
        (container: HTMLElement): HTMLElement | null => {
            const selectors = [
                ".mantine-ScrollArea-viewport",
                "[data-radix-scroll-area-viewport]",
                ".m-scroll-area-viewport",
                "[data-mantine-scroll-area-viewport]",
                ".mantine-scroll-area-viewport",
            ];

            for (const selector of selectors) {
                const element = container.querySelector(
                    selector
                ) as HTMLElement;
                if (element) {
                    return element;
                }
            }

            // Fallback: look for any scrollable element
            const scrollableElements = container.querySelectorAll("*");
            for (let i = 0; i < scrollableElements.length; i++) {
                const element = scrollableElements[i] as HTMLElement;
                const computedStyle = window.getComputedStyle(element);
                if (
                    (computedStyle.overflowY === "scroll" ||
                        computedStyle.overflowY === "auto" ||
                        computedStyle.overflow === "scroll" ||
                        computedStyle.overflow === "auto") &&
                    element.scrollHeight > element.clientHeight
                ) {
                    return element;
                }
            }

            return null;
        },
        []
    );

    const updateViewport = useCallback(() => {
        if (scrollAreaRef?.current) {
            const foundViewport = findScrollableViewport(scrollAreaRef.current);

            if (foundViewport) {
                setViewport(foundViewport);
                setIsReady(true);
                return foundViewport;
            } else {
                setViewport(scrollAreaRef.current);
                setIsReady(true);
                return scrollAreaRef.current;
            }
        }
        setIsReady(false);
        return null;
    }, [scrollAreaRef, findScrollableViewport]);

    useEffect(() => {
        const maxRetries = 10;
        let retryCount = 0;

        const tryFindViewport = () => {
            const vp = updateViewport();
            if (vp || retryCount >= maxRetries) {
                if (vp) {
                    setTimeout(() => {
                        reinitializeRef.current();
                    }, 100);
                }
                return;
            }

            retryCount++;
            setTimeout(tryFindViewport, 100);
        };

        setTimeout(tryFindViewport, 50);
    }, [updateViewport]);

    useLayoutEffect(() => {
        if (isReady) {
            setTimeout(() => {
                reinitializeRef.current();
            }, 100);
        }
    }, [dependency, isReady]);

    if (!isReady || !viewport) {
        return null;
    }

    return (
        <TableOfContents
            autoContrast
            reinitializeRef={reinitializeRef}
            variant="filled"
            color="blue"
            size="sm"
            radius="sm"
            scrollSpyOptions={{
                selector:
                    '[data-story-content="true"] :is(h1, h2, h3, h4, h5, h6)',
                scrollHost: viewport,
            }}
            getControlProps={({ active, data }) => ({
                onClick: () => {
                    const element = data.getNode();

                    if (viewport && element) {
                        try {
                            const containerRect =
                                viewport.getBoundingClientRect();
                            const elementRect = element.getBoundingClientRect();
                            const scrollTop = viewport.scrollTop;
                            const elementOffsetTop =
                                elementRect.top - containerRect.top + scrollTop;

                            viewport.scrollTo({
                                top: elementOffsetTop - 20,
                                behavior: "smooth",
                            });
                        } catch {
                            try {
                                const offsetTop = element.offsetTop;
                                viewport.scrollTo({
                                    top: offsetTop - 20,
                                    behavior: "smooth",
                                });
                            } catch {
                                element.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                });
                            }
                        }
                    }
                },
                children: data.value,
                style: {
                    color: active
                        ? "var(--mantine-color-blue-1)"
                        : "var(--mantine-color-gray-6)",
                    cursor: "pointer",
                },
            })}
        />
    );
}
