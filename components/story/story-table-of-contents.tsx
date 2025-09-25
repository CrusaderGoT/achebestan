"use client";

import { TableOfContents } from "@mantine/core";
import {
    RefObject,
    useCallback,
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

    // Use callback to update viewport when scrollArea changes
    const updateViewport = useCallback(() => {
        if (scrollAreaRef?.current) {
            const scrollAreaViewport = scrollAreaRef.current.querySelector(
                "[data-radix-scroll-area-viewport]"
            ) as HTMLElement;
            setViewport(scrollAreaViewport);
        }
    }, [scrollAreaRef]);

    // Update viewport when dependency changes
    useLayoutEffect(() => {
        updateViewport();
        reinitializeRef.current();
    }, [dependency, updateViewport]);

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
                scrollHost: viewport || undefined,
            }}
            getControlProps={({ active, data }) => ({
                onClick: () => {
                    const element = data.getNode();
                    const scrollViewport = viewport;

                    if (scrollViewport && element) {
                        // Get the element's position relative to the scroll container
                        const containerRect =
                            scrollViewport.getBoundingClientRect();
                        const elementRect = element.getBoundingClientRect();

                        // Calculate the scroll position
                        const scrollTop = scrollViewport.scrollTop;
                        const elementOffsetTop =
                            elementRect.top - containerRect.top + scrollTop;

                        // Scroll to the element with some offset
                        scrollViewport.scrollTo({
                            top: elementOffsetTop + 50,
                            behavior: "smooth",
                        });
                    } else {
                        // Fallback to default behavior
                        element.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
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
