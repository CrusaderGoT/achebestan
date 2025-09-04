// utils/bookmarkRenderer.ts
import styles from "@/styles/bookmark-indicator.module.css";
import { Bookmark } from "../types/bookmark";

let renderTimeout: NodeJS.Timeout | null = null;

export function renderBookmarkIndicators(bookmarks: Bookmark[]) {
    // Clear any pending renders to avoid race conditions
    if (renderTimeout) {
        clearTimeout(renderTimeout);
    }

    renderTimeout = setTimeout(() => {
        _renderBookmarkIndicators(bookmarks);
    }, 50); // Small delay to ensure DOM is stable
}

// Force immediate render without timeout (for critical updates)
export function forceRenderBookmarkIndicators(bookmarks: Bookmark[]) {
    if (renderTimeout) {
        clearTimeout(renderTimeout);
    }
    _renderBookmarkIndicators(bookmarks);
}

function _renderBookmarkIndicators(bookmarks: Bookmark[]) {
    try {
        // Remove existing indicators
        document
            .querySelectorAll(`.${styles.indicator}`)
            .forEach((el) => el.remove());

        if (!bookmarks.length) return;

        // Sort by position (descending) to insert from end to start
        const sortedBookmarks = [...bookmarks].sort(
            (a, b) => b.position - a.position
        );

        let successfulRenders = 0;

        sortedBookmarks.forEach((bookmark, index) => {
            try {
                const container = document.querySelector(
                    bookmark.containerSelector
                );
                if (!container) {
                    console.warn(
                        `Container not found for bookmark ${bookmark.id}:`,
                        bookmark.containerSelector
                    );
                    return;
                }

                const textContent = container.textContent || "";
                if (bookmark.position > textContent.length) {
                    console.warn(
                        `Bookmark position ${bookmark.position} exceeds text length ${textContent.length} for bookmark ${bookmark.id}`
                    );
                    return;
                }

                const indicator = createBookmarkIndicator(bookmark);
                const success = insertIndicatorAtPosition(
                    container,
                    indicator,
                    bookmark.position
                );

                if (success) {
                    successfulRenders++;
                } else {
                    console.warn(
                        `Failed to insert indicator for bookmark ${bookmark.id}`
                    );
                }
            } catch (error) {
                console.error(
                    `Error rendering bookmark ${bookmark.id}:`,
                    error
                );
            }
        });

        console.log(
            `Successfully rendered ${successfulRenders}/${bookmarks.length} bookmarks`
        );
    } catch (error) {
        console.error("Error in renderBookmarkIndicators:", error);
    }
}

function createBookmarkIndicator(bookmark: Bookmark): HTMLElement {
    const indicator = document.createElement("span");
    indicator.className = styles.indicator;
    indicator.setAttribute("data-bookmark-id", bookmark.id);
    indicator.title = `Bookmark: ${bookmark.contextText}${
        bookmark.userNote ? ` - ${bookmark.userNote}` : ""
    }`;
    indicator.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
        </svg>
    `;

    // Add click handler to scroll to bookmark
    indicator.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        indicator.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    return indicator;
}

function insertIndicatorAtPosition(
    container: Element,
    indicator: HTMLElement,
    position: number
): boolean {
    try {
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null
        );

        let currentPosition = 0;
        let targetNode: Node | null = null;
        let targetOffset = 0;

        while (walker.nextNode()) {
            const node = walker.currentNode;
            const nodeLength = node.textContent?.length || 0;

            if (currentPosition + nodeLength >= position) {
                targetNode = node;
                targetOffset = position - currentPosition;
                break;
            }

            currentPosition += nodeLength;
        }

        if (targetNode && targetNode.textContent && targetNode.parentNode) {
            const beforeText = targetNode.textContent.substring(
                0,
                targetOffset
            );
            const afterText = targetNode.textContent.substring(targetOffset);

            const beforeNode = document.createTextNode(beforeText);
            const afterNode = document.createTextNode(afterText);

            const parent = targetNode.parentNode;

            // Insert the nodes in the correct order
            parent.insertBefore(beforeNode, targetNode);
            parent.insertBefore(indicator, targetNode);
            parent.insertBefore(afterNode, targetNode);
            parent.removeChild(targetNode);

            return true;
        }

        return false;
    } catch (error) {
        console.error("Error inserting indicator at position:", error);
        return false;
    }
}

// Utility function to check if bookmarks need re-rendering
export function shouldReRenderBookmarks(bookmarks: Bookmark[]): boolean {
    const existingIndicators = document.querySelectorAll(
        `.${styles.indicator}`
    );

    // If count doesn't match, re-render needed
    if (existingIndicators.length !== bookmarks.length) {
        return true;
    }

    // Check if all bookmark IDs are present
    const existingIds = Array.from(existingIndicators)
        .map((el) => el.getAttribute("data-bookmark-id"))
        .filter((id) => id !== null);

    const bookmarkIds = bookmarks.map((b) => b.id);

    return !bookmarkIds.every((id) => existingIds.includes(id));
}
