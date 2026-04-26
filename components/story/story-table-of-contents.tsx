"use client";

import {
    ActionIcon,
    Affix,
    Box,
    CloseButton,
    Group,
    TableOfContents,
    Text,
    Transition,
} from "@mantine/core";
import {
    useClickOutside,
    useDisclosure,
    useIsomorphicEffect,
} from "@mantine/hooks";
import { IconListTree } from "@tabler/icons-react";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";

export function StoryTableOfContents({
    content,
    scrollAreaTocRef,
    height,
    width,
}: {
    content: string;
    scrollAreaTocRef?: RefObject<HTMLDivElement | null>;
    height?: number;
    width?: number;
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
                    selector,
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
        [],
    );

    const updateViewport = useCallback(() => {
        if (scrollAreaTocRef?.current) {
            const foundViewport = findScrollableViewport(
                scrollAreaTocRef.current,
            );

            if (foundViewport) {
                setViewport(foundViewport);
                setIsReady(true);
                return foundViewport;
            } else {
                setViewport(scrollAreaTocRef.current);
                setIsReady(true);
                return scrollAreaTocRef.current;
            }
        }
        setIsReady(false);
        return null;
    }, [scrollAreaTocRef, findScrollableViewport]);

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

    useIsomorphicEffect(() => {
        if (isReady) {
            setTimeout(() => {
                reinitializeRef.current();
            }, 100);
        }
    }, [content, isReady, height, width]);

    function hasHeadingOrList(el: HTMLElement) {
        return el.querySelector("h1, h2, h3, h4, h5, h6, ul, li") !== null;
    }

    const [opened, { toggle, close }] = useDisclosure();

    const ref = useClickOutside(() => close());

    if (!isReady || !viewport || !hasHeadingOrList(viewport)) {
        return null;
    }

    return (
        <>
            <ActionIcon variant="subtle" size="sm" onClick={toggle}>
                <IconListTree size={16} />
            </ActionIcon>

            <Affix
                position={{
                    top: 70,
                    left: 30,
                }}
                withinPortal={false}
            >
                <Transition
                    mounted={opened}
                    duration={400}
                    transition="slide-right"
                    timingFunction="ease-in-out"
                >
                    {(styles) => (
                        <Box
                            ref={ref}
                            style={{
                                ...styles,
                                backdropFilter: "blur(99px)",
                            }}
                            p={"md"}
                        >
                            <Group justify="space-between" mb={"xs"} gap={"xl"}>
                                <Text fw={700}>Table of Contents</Text>

                                <CloseButton size={"sm"} onClick={close} />
                            </Group>

                            <TableOfContents
                                autoContrast
                                reinitializeRef={reinitializeRef}
                                variant="filled"
                                color="blue"
                                size="sm"
                                radius="sm"
                                minDepthToOffset={0}
                                depthOffset={20}
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
                                                const elementRect =
                                                    element.getBoundingClientRect();
                                                const scrollTop =
                                                    viewport.scrollTop;
                                                const elementOffsetTop =
                                                    elementRect.top -
                                                    containerRect.top +
                                                    scrollTop;

                                                viewport.scrollTo({
                                                    top: elementOffsetTop,
                                                    behavior: "auto",
                                                });
                                            } catch {
                                                try {
                                                    const offsetTop =
                                                        element.offsetTop;
                                                    viewport.scrollTo({
                                                        top: offsetTop,
                                                        behavior: "auto",
                                                    });
                                                } catch {
                                                    element.scrollIntoView({
                                                        behavior: "auto",
                                                        block: "start",
                                                    });
                                                }
                                            }

                                            close();
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
                        </Box>
                    )}
                </Transition>
            </Affix>
        </>
    );
}
