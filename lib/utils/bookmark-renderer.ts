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
    // Clear any pending renders to avoid race conditions
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
        }, 50); // Small delay to ensure DOM is stable
    });
}

// Force immediate render without timeout (for critical updates)
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
                    console.warn(
                        `Container not found for bookmark ${bookmark.id}:`,
                        bookmark.containerSelector
                    );
                    result.failed.push(bookmark);
                    return;
                }

                const textContent = container.textContent || "";
                if (bookmark.position > textContent.length) {
                    console.warn(
                        `Bookmark position ${bookmark.position} exceeds text length ${textContent.length} for bookmark ${bookmark.id}`
                    );
                    result.failed.push(bookmark);
                    return;
                }

                // Additional validation: check if the context text still exists in the content
                // Only mark as invalid if the text is completely missing
                if (!isBookmarkStillValid(container, bookmark)) {
                    console.warn(
                        `Bookmark context no longer exists in content for bookmark ${bookmark.id}. Context: "${bookmark.contextText}"`
                    );
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
                    console.warn(
                        `Failed to insert indicator for bookmark ${bookmark.id}`
                    );
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
            `Successfully rendered ${result.successful.length}/${bookmarks.length} bookmarks`
        );
        if (result.failed.length > 0) {
            console.log(
                `Failed to render ${result.failed.length} bookmarks:`,
                result.failed.map((b) => ({
                    id: b.id,
                    contextText: b.contextText,
                }))
            );
        }
    } catch (error) {
        console.error("Error in renderBookmarkIndicators:", error);
        // If there's a general error, consider all bookmarks as failed
        result.failed = [...bookmarks];
        result.successful = [];
    }

    return result;
}

function isBookmarkStillValid(container: Element, bookmark: Bookmark): boolean {
    const textContent = container.textContent || "";
    const contextText = bookmark.contextText.trim();

    // If context is too short, skip validation
    if (contextText.length < 5) {
        console.log(
            `Skipping validation for bookmark ${bookmark.id}: context too short`
        );
        return true;
    }

    const normalizedContent = textContent
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
    const normalizedContext = contextText
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    // First check: exact substring match anywhere in the content
    if (normalizedContent.includes(normalizedContext)) {
        console.log(`Bookmark ${bookmark.id} valid: exact context match found`);
        return true;
    }

    // Second check: break context into meaningful phrases and check if any exist
    // Split on punctuation and filter out very short segments
    const contextPhrases = normalizedContext
        .split(/[.!?;,]/)
        .map((phrase) => phrase.trim())
        .filter((phrase) => phrase.length > 8); // Only consider substantial phrases

    // If we have meaningful phrases, check if any of them exist
    if (contextPhrases.length > 0) {
        const foundPhrases = contextPhrases.filter((phrase) =>
            normalizedContent.includes(phrase)
        );

        // If at least one substantial phrase is found, consider it valid
        if (foundPhrases.length > 0) {
            console.log(
                `Bookmark ${bookmark.id} valid: found ${foundPhrases.length}/${contextPhrases.length} phrases`
            );
            return true;
        }
    }

    // Third check: word-by-word analysis (more conservative than before)
    const contextWords = normalizedContext
        .split(" ")
        .filter((word) => word.length > 3) // Only consider words longer than 3 chars
        .filter((word) => !isCommonWord(word)); // Filter out common words

    if (contextWords.length === 0) {
        // If no meaningful words, assume valid to be safe
        console.log(
            `Bookmark ${bookmark.id} valid: no meaningful words to validate against`
        );
        return true;
    }

    // Check if at least 80% of meaningful words are present
    const foundWords = contextWords.filter((word) =>
        normalizedContent.includes(word)
    );

    const matchRatio = foundWords.length / contextWords.length;
    const isValid = matchRatio >= 0.8;

    console.log(
        `Bookmark ${bookmark.id} word validation: ${foundWords.length}/${
            contextWords.length
        } meaningful words found (${(matchRatio * 100).toFixed(1)}%) - ${
            isValid ? "VALID" : "INVALID"
        }`
    );

    if (!isValid) {
        console.log(`Context: "${contextText}"`);
        console.log(
            `Missing words: ${contextWords
                .filter((word) => !normalizedContent.includes(word))
                .join(", ")}`
        );
    }

    // Require higher threshold (80%) since we're being more selective about words
    return isValid;
}

// Helper function to identify common words that shouldn't be used for validation
function isCommonWord(word: string): boolean {
    const commonWords = new Set([
        "the",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "from",
        "up",
        "about",
        "into",
        "through",
        "during",
        "before",
        "after",
        "above",
        "below",
        "between",
        "among",
        "this",
        "that",
        "these",
        "those",
        "i",
        "you",
        "he",
        "she",
        "it",
        "we",
        "they",
        "me",
        "him",
        "her",
        "us",
        "them",
        "my",
        "your",
        "his",
        "her",
        "its",
        "our",
        "their",
        "a",
        "an",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "may",
        "might",
        "must",
        "can",
        "very",
        "quite",
        "just",
        "only",
        "also",
        "even",
        "still",
        "more",
        "most",
        "less",
        "much",
        "many",
        "some",
        "all",
        "any",
        "each",
        "every",
        "no",
        "not",
        "now",
        "then",
        "here",
        "there",
        "where",
        "when",
        "why",
        "how",
        "what",
        "who",
        "which",
    ]);

    return commonWords.has(word.toLowerCase());
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
