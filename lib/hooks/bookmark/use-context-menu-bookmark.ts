// hooks/useContextMenuBookmark.ts
import { getContextAtPosition } from "@/lib/utils/bookmark-renderer";
import { useViewportSize, useWindowEvent } from "@mantine/hooks";
import { useCallback, useRef, useState } from "react";

export function useContextMenuBookmark() {
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const [targetInfo, setTargetInfo] = useState<{
        element: Element;
        textPosition: number;
        contextText: string;
        containerSelector: string;
    } | null>(null);

    const { width: viewportWidth, height: viewportHeight } = useViewportSize();
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const longPressTimerRef = useRef<NodeJS.Timeout>(null);
    const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
    const isLongPressRef = useRef(false);

    const generateSelector = useCallback((element: Element): string => {
        const tagName = element.tagName.toLowerCase();
        const id = element.id;
        if (id) return `#${id}`;

        const classes = Array.from(element.classList);
        if (classes.length > 0) {
            return `${tagName}.${classes.join(".")}`;
        }

        // Use data attributes
        const dataAttrs = Array.from(element.attributes)
            .filter((attr) => attr.name.startsWith("data-"))
            .map((attr) => `[${attr.name}="${attr.value}"]`)
            .join("");
        if (dataAttrs) return `${tagName}${dataAttrs}`;

        // nth-of-type fallback
        const parent = element.parentElement;
        if (parent) {
            const siblings = Array.from(parent.children).filter(
                (child) => child.tagName === element.tagName
            );
            const index = siblings.indexOf(element) + 1;
            return `${generateSelector(
                parent
            )} > ${tagName}:nth-of-type(${index})`;
        }
        return tagName;
    }, []);

    const getTextPositionFromPoint = useCallback(
        (element: Element, clientX: number, clientY: number) => {
            const range = document.caretPositionFromPoint(clientX, clientY);
            if (!range || !element.contains(range.offsetNode)) {
                return { position: 0, contextText: "" };
            }

            // Calculate position within the element's text content
            const beforeRange = document.createRange();
            beforeRange.setStart(element, 0);
            beforeRange.setEnd(range.offsetNode, range.offset);
            const position = beforeRange.toString().length;

            // Get context text
            const contextText = getContextAtPosition(element, position);

            return { position, contextText: contextText };
        },
        []
    );

    // NEW: Check if the target is within the story content area
    const isWithinStoryContent = useCallback((target: Element): boolean => {
        let current: Element | null = target;

        while (current) {
            // Check by data attribute
            if (current.getAttribute("data-story-content") === "true") {
                return true;
            }

            current = current.parentElement;
        }

        return false;
    }, []);

    const findBookmarkableContainer = useCallback(
        (target: Element): Element | null => {
            let current: Element | null = target;

            while (current) {
                const tagName = current.tagName;
                if (
                    [
                        "P",
                        "H1",
                        "H2",
                        "H3",
                        "H4",
                        "H5",
                        "H6",
                        "DIV",
                        "ARTICLE",
                        "SECTION",
                    ].includes(tagName)
                ) {
                    // Check if this element has meaningful text content
                    const textContent = current.textContent?.trim();
                    if (textContent && textContent.length > 10) {
                        return current;
                    }
                }
                current = current.parentElement;
            }

            return null;
        },
        []
    );

    const handleContextMenu = useCallback(
        (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target) return;

            // Check if we're within the story content area first
            if (!isWithinStoryContent(target)) {
                return; // Don't show context menu if not within story content
            }

            // Clear existing indicators if present to allow fresh context menu
            const existingIndicators =
                document.querySelectorAll("[data-bookmark-id]");
            if (existingIndicators.length > 0) {
                existingIndicators.forEach((el) => el.remove());
            }

            // Check if we're within a bookmarkable container
            const container = findBookmarkableContainer(target);
            if (!container) return;

            event.preventDefault();
            event.stopPropagation();

            const { position, contextText } = getTextPositionFromPoint(
                container,
                event.clientX,
                event.clientY
            );

            if (!contextText) return;

            // Calculate menu position
            let x = event.clientX;
            let y = event.clientY;

            // Keep menu within viewport
            const menuWidth = 200; // Approximate menu width
            const menuHeight = 120; // Approximate menu height

            if (x + menuWidth > viewportWidth) {
                x = viewportWidth - menuWidth - 10;
            }
            if (y + menuHeight > viewportHeight) {
                y = y - menuHeight;
            }

            setTargetInfo({
                element: container,
                textPosition: position,
                contextText,
                containerSelector: generateSelector(container),
            });
            setMenuPosition({ x, y });
            setShowContextMenu(true);
        },
        [
            isWithinStoryContent,
            findBookmarkableContainer,
            getTextPositionFromPoint,
            generateSelector,
            viewportWidth,
            viewportHeight,
        ]
    );

    // Touch handlers for long press
    const handleTouchStart = useCallback(
        (event: TouchEvent) => {
            const touch = event.touches[0];
            if (!touch) return;

            const target = event.target as Element;
            if (!target) return;

            // Check if we're within the story content area first
            if (!isWithinStoryContent(target)) {
                return; // Don't handle touch if not within story content
            }

            // Clear existing indicators if present to allow fresh context menu
            const existingIndicators =
                document.querySelectorAll("[data-bookmark-id]");
            if (existingIndicators.length > 0) {
                existingIndicators.forEach((el) => el.remove());
            }

            const container = findBookmarkableContainer(target);
            if (!container) return;

            touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
            isLongPressRef.current = false;

            // Clear any existing timer
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
            }

            // Set long press timer
            longPressTimerRef.current = setTimeout(() => {
                if (!touchStartPosRef.current) return;

                isLongPressRef.current = true;

                // Trigger haptic feedback if available
                if ("vibrate" in navigator) {
                    navigator.vibrate(50);
                }

                const { position, contextText } = getTextPositionFromPoint(
                    container,
                    touchStartPosRef.current.x,
                    touchStartPosRef.current.y
                );

                if (!contextText) return;

                // Calculate menu position for touch
                let x = touchStartPosRef.current.x;
                let y = touchStartPosRef.current.y;

                const menuWidth = 200;
                const menuHeight = 120;

                if (x + menuWidth > viewportWidth) {
                    x = viewportWidth - menuWidth - 10;
                }
                if (y + menuHeight > viewportHeight) {
                    y = y - menuHeight;
                }

                setTargetInfo({
                    element: container,
                    textPosition: position,
                    contextText,
                    containerSelector: generateSelector(container),
                });
                setMenuPosition({ x, y });
                setShowContextMenu(true);
            }, 500); // 500ms long press duration
        },
        [
            isWithinStoryContent,
            findBookmarkableContainer,
            getTextPositionFromPoint,
            generateSelector,
            viewportWidth,
            viewportHeight,
        ]
    );

    const handleTouchMove = useCallback((event: TouchEvent) => {
        if (!touchStartPosRef.current) return;

        const touch = event.touches[0];
        if (!touch) return;

        // Check if finger moved too much (cancel long press)
        const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
        const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);

        if (deltaX > 10 || deltaY > 10) {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
            }
            touchStartPosRef.current = null;
        }
    }, []);

    const handleTouchEnd = useCallback((event: TouchEvent) => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
        }

        // Prevent default click if it was a long press
        if (isLongPressRef.current) {
            event.preventDefault();
            event.stopPropagation();
        }

        touchStartPosRef.current = null;
        isLongPressRef.current = false;
    }, []);

    const hideContextMenu = useCallback(() => {
        setShowContextMenu(false);
        setMenuPosition(null);
        setTargetInfo(null);
    }, []);

    // Close menu when clicking outside
    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (
                showContextMenu &&
                contextMenuRef.current &&
                !contextMenuRef.current.contains(event.target as Node)
            ) {
                hideContextMenu();
            }
        },
        [showContextMenu, hideContextMenu]
    );

    // Handle escape key
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape" && showContextMenu) {
                hideContextMenu();
            }
        },
        [showContextMenu, hideContextMenu]
    );

    // Set up event listeners
    useWindowEvent("contextmenu", handleContextMenu);
    useWindowEvent("touchstart", handleTouchStart, { passive: false });
    useWindowEvent("touchmove", handleTouchMove, { passive: false });
    useWindowEvent("touchend", handleTouchEnd, { passive: false });
    useWindowEvent("click", handleClickOutside);
    useWindowEvent("keydown", handleKeyDown);

    const getBookmarkData = useCallback(() => {
        if (!targetInfo) return null;

        return {
            containerSelector: targetInfo.containerSelector,
            position: targetInfo.textPosition,
            contextText: targetInfo.contextText,
        };
    }, [targetInfo]);

    return {
        showContextMenu,
        menuPosition,
        contextMenuRef,
        hideContextMenu,
        getBookmarkData,
    };
}
