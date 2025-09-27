// utils/bookmarkRenderer.ts
import styles from "@/styles/bookmark/bookmark-indicator.module.css";
import { Bookmark } from "../../types/bookmark";

let renderTimeout: NodeJS.Timeout | null = null;

export interface RenderResult {
    successful: Bookmark[];
    failed: Bookmark[];
}

export function renderBookmarkIndicators(
    bookmarks: Bookmark[],
    onFailedBookmarksDetected?: (failedBookmarks: Bookmark[]) => void
): Promise<RenderResult> {
    if (renderTimeout) {
        clearTimeout(renderTimeout);
    }

    return new Promise((resolve) => {
        renderTimeout = setTimeout(() => {
            const result = _renderBookmarkIndicators(bookmarks);
            if (result.failed.length > 0 && onFailedBookmarksDetected) {
                onFailedBookmarksDetected(result.failed);
            }
            resolve(result);
        }, 50);
    });
}

export function forceRenderBookmarkIndicators(
    bookmarks: Bookmark[],
    onFailedBookmarksDetected?: (failedBookmarks: Bookmark[]) => void
): RenderResult {
    if (renderTimeout) {
        clearTimeout(renderTimeout);
    }
    const result = _renderBookmarkIndicators(bookmarks);
    if (result.failed.length > 0 && onFailedBookmarksDetected) {
        onFailedBookmarksDetected(result.failed);
    }
    return result;
}

function _renderBookmarkIndicators(bookmarks: Bookmark[]): RenderResult {
    const result: RenderResult = {
        successful: [],
        failed: [],
    };

    try {
        // Remove existing indicators
        document
            .querySelectorAll(`.${styles.indicator}`)
            .forEach((el) => el.remove());

        if (!bookmarks.length) return result;

        // Sort by position (descending) to insert from end to start
        const sortedBookmarks = [...bookmarks].sort(
            (a, b) => b.position - a.position
        );

        sortedBookmarks.forEach((bookmark) => {
            try {
                const container = document.querySelector(
                    bookmark.containerSelector
                );
                if (!container) {
                    result.failed.push(bookmark);
                    return;
                }

                // Validate bookmark using same logic as when saving
                if (!isBookmarkStillValid(container, bookmark)) {
                    result.failed.push(bookmark);
                    return;
                }

                const indicator = createBookmarkIndicator(bookmark);
                const success = insertIndicatorAtPosition(
                    container,
                    indicator,
                    bookmark.position
                );

                if (success) {
                    result.successful.push(bookmark);
                } else {
                    result.failed.push(bookmark);
                }
            } catch (error) {
                console.error(
                    `Error rendering bookmark ${bookmark.id}:`,
                    error
                );
                result.failed.push(bookmark);
            }
        });

        console.log(
            `Rendered ${result.successful.length}/${bookmarks.length} bookmarks`
        );
    } catch (error) {
        console.error("Error in renderBookmarkIndicators:", error);
        result.failed = [...bookmarks];
        result.successful = [];
    }

    return result;
}

function isBookmarkStillValid(container: Element, bookmark: Bookmark): boolean {
    try {
        // Get current context at the bookmark position using same logic as when saving
        const currentContext = getContextAtPosition(
            container,
            bookmark.position
        );

        if (!currentContext) {
            return false;
        }

        // Simple substring check - if saved context exists in current context, it's valid
        return currentContext.includes(bookmark.contextText.trim());
    } catch (error) {
        console.error(`Error validating bookmark ${bookmark.id}:`, error);
        return false;
    }
}

function getContextAtPosition(element: Element, position: number): string {
    try {
        const fullText = element.textContent || "";

        if (position > fullText.length) {
            return "";
        }

        // Get context text (40 chars before and after) - same as in bookmark creation
        const contextStart = Math.max(0, position - 40);
        const contextEnd = Math.min(fullText.length, position + 40);
        const contextText = fullText.substring(contextStart, contextEnd);

        return contextText.trim();
    } catch (error) {
        console.error("Error extracting context at position:", error);
        return "";
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

export function shouldReRenderBookmarks(bookmarks: Bookmark[]): boolean {
    const existingIndicators = document.querySelectorAll(
        `.${styles.indicator}`
    );

    if (existingIndicators.length !== bookmarks.length) {
        return true;
    }

    const existingIds = Array.from(existingIndicators)
        .map((el) => el.getAttribute("data-bookmark-id"))
        .filter((id) => id !== null);

    const bookmarkIds = bookmarks.map((b) => b.id);

    return !bookmarkIds.every((id) => existingIds.includes(id));
}
