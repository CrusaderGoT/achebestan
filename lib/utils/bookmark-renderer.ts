// utils/bookmarkRenderer.ts
import styles from "@/styles/bookmark-indicator.module.css";
import { Bookmark } from "../types/bookmark";

export function renderBookmarkIndicators(bookmarks: Bookmark[]) {
    // Remove existing indicators
    document
        .querySelectorAll(`.${styles.indicator}`)
        .forEach((el) => el.remove());

    // Sort by position (descending) to insert from end to start
    const sortedBookmarks = [...bookmarks].sort(
        (a, b) => b.position - a.position
    );

    sortedBookmarks.forEach((bookmark) => {
        const container = document.querySelector(bookmark.containerSelector);
        if (!container) return;

        const textContent = container.textContent || "";
        if (bookmark.position > textContent.length) return;

        const indicator = document.createElement("span");
        indicator.className = styles.indicator;
        indicator.setAttribute("data-bookmark-id", bookmark.id);
        indicator.title = `Bookmark: ${bookmark.contextText}`;
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

        insertIndicatorAtPosition(container, indicator, bookmark.position);
    });
}

function insertIndicatorAtPosition(
    container: Element,
    indicator: HTMLElement,
    position: number
) {
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

    if (targetNode && targetNode.textContent) {
        const beforeText = targetNode.textContent.substring(0, targetOffset);
        const afterText = targetNode.textContent.substring(targetOffset);

        const beforeNode = document.createTextNode(beforeText);
        const afterNode = document.createTextNode(afterText);

        const parent = targetNode.parentNode;
        if (parent) {
            parent.insertBefore(beforeNode, targetNode);
            parent.insertBefore(indicator, targetNode);
            parent.insertBefore(afterNode, targetNode);
            parent.removeChild(targetNode);
        }
    }
}
