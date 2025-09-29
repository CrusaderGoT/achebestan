// hooks/useContextMenuBookmark.ts - Improved with better event handling
import { getContextAtPosition } from "@/lib/utils/bookmark-renderer";
import { useViewportSize } from "@mantine/hooks";
import { useCallback, useEffect, useRef, useState } from "react";

const LONG_PRESS_DURATION = 500;
const TOUCH_MOVE_THRESHOLD = 10;
const MENU_WIDTH = 200;
const MENU_HEIGHT = 120;

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
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
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

            const beforeRange = document.createRange();
            beforeRange.setStart(element, 0);
            beforeRange.setEnd(range.offsetNode, range.offset);
            const position = beforeRange.toString().length;

            const contextText = getContextAtPosition(element, position);

            return { position, contextText };
        },
        []
    );

    const isWithinStoryContent = useCallback((target: Element): boolean => {
        let current: Element | null = target;
        while (current) {
            if (current.getAttribute("data-story-content") === "true") {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }, []);

    const findBookmarkableContainer = useCallback(
        (target: Element): Element | null => {
            const validTags = new Set([
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
            ]);

            let current: Element | null = target;
            while (current) {
                if (validTags.has(current.tagName)) {
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

    const calculateMenuPosition = useCallback(
        (clientX: number, clientY: number) => {
            let x = clientX;
            let y = clientY;

            if (x + MENU_WIDTH > viewportWidth) {
                x = viewportWidth - MENU_WIDTH - 10;
            }

            if (y + MENU_HEIGHT > viewportHeight) {
                y = Math.max(10, y - MENU_HEIGHT);
            }

            return { x, y };
        },
        [viewportWidth, viewportHeight]
    );

    const showMenu = useCallback(
        (container: Element, clientX: number, clientY: number) => {
            const { position, contextText } = getTextPositionFromPoint(
                container,
                clientX,
                clientY
            );

            if (!contextText) return;

            const menuPos = calculateMenuPosition(clientX, clientY);

            setTargetInfo({
                element: container,
                textPosition: position,
                contextText,
                containerSelector: generateSelector(container),
            });
            setMenuPosition(menuPos);
            setShowContextMenu(true);
        },
        [getTextPositionFromPoint, calculateMenuPosition, generateSelector]
    );

    const handleContextMenu = useCallback(
        (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target || !isWithinStoryContent(target)) {
                return;
            }

            const container = findBookmarkableContainer(target);
            if (!container) return;

            event.preventDefault();
            event.stopPropagation();

            showMenu(container, event.clientX, event.clientY);
        },
        [isWithinStoryContent, findBookmarkableContainer, showMenu]
    );

    const clearLongPressTimer = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    const handleTouchStart = useCallback(
        (event: TouchEvent) => {
            const touch = event.touches[0];
            if (!touch) return;

            const target = event.target as Element;
            if (!target || !isWithinStoryContent(target)) {
                return;
            }

            const container = findBookmarkableContainer(target);
            if (!container) return;

            touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
            isLongPressRef.current = false;

            clearLongPressTimer();

            longPressTimerRef.current = setTimeout(() => {
                if (!touchStartPosRef.current) return;

                isLongPressRef.current = true;

                // Haptic feedback
                if ("vibrate" in navigator) {
                    navigator.vibrate(50);
                }

                showMenu(
                    container,
                    touchStartPosRef.current.x,
                    touchStartPosRef.current.y
                );
            }, LONG_PRESS_DURATION);
        },
        [
            isWithinStoryContent,
            findBookmarkableContainer,
            clearLongPressTimer,
            showMenu,
        ]
    );

    const handleTouchMove = useCallback(
        (event: TouchEvent) => {
            if (!touchStartPosRef.current) return;

            const touch = event.touches[0];
            if (!touch) return;

            const deltaX = Math.abs(touch.clientX - touchStartPosRef.current.x);
            const deltaY = Math.abs(touch.clientY - touchStartPosRef.current.y);

            if (
                deltaX > TOUCH_MOVE_THRESHOLD ||
                deltaY > TOUCH_MOVE_THRESHOLD
            ) {
                clearLongPressTimer();
                touchStartPosRef.current = null;
            }
        },
        [clearLongPressTimer]
    );

    const handleTouchEnd = useCallback(
        (event: TouchEvent) => {
            clearLongPressTimer();

            if (isLongPressRef.current) {
                event.preventDefault();
                event.stopPropagation();
            }

            touchStartPosRef.current = null;
            isLongPressRef.current = false;
        },
        [clearLongPressTimer]
    );

    const hideContextMenu = useCallback(() => {
        setShowContextMenu(false);
        setMenuPosition(null);
        setTargetInfo(null);
    }, []);

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

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape" && showContextMenu) {
                hideContextMenu();
            }
        },
        [showContextMenu, hideContextMenu]
    );

    // Set up event listeners
    useEffect(() => {
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("touchstart", handleTouchStart, {
            passive: false,
        });
        document.addEventListener("touchmove", handleTouchMove, {
            passive: false,
        });
        document.addEventListener("touchend", handleTouchEnd, {
            passive: false,
        });
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
            clearLongPressTimer();
        };
    }, [
        handleContextMenu,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleClickOutside,
        handleKeyDown,
        clearLongPressTimer,
    ]);

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
