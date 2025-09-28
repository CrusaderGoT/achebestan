// ==============================================================================
// utils/bookmarkRenderer.ts - Pure utility functions and DOM manipulation
// ==============================================================================

import styles from "@/styles/bookmark/bookmark-indicator.module.css";
import { Bookmark } from "../../types/bookmark";

let renderTimeout: NodeJS.Timeout | null = null;

export interface RenderResult {
    successful: Bookmark[];
    failed: Bookmark[];
}

// Main rendering functions
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

                // Validate bookmark using enhanced HTML-aware logic
                if (!isBookmarkStillValidEnhanced(container, bookmark)) {
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

// Text extraction and context utilities
export function getContextAtPosition(
    element: Element,
    position: number,
    before: number = 40,
    after: number = 40
): string {
    try {
        // Create a clone of the element to work with clean text
        const cleanElement = element.cloneNode(true) as Element;

        // Remove all bookmark indicators from the clone
        cleanElement
            .querySelectorAll("[data-bookmark-id]")
            .forEach((indicator) => {
                indicator.remove();
            });

        const fullText = cleanElement.textContent || "";

        if (position > fullText.length) {
            return "";
        }

        // Get context text (N chars before and after)
        const contextStart = Math.max(0, position - before);
        const contextEnd = Math.min(fullText.length, position + after);
        const contextText = fullText.substring(contextStart, contextEnd);

        return contextText.trim();
    } catch (error) {
        console.error("Error extracting context at position:", error);
        return "";
    }
}

// Text comparison utilities
export function shouldUpdateBookmarkContext(
    currentContext: string,
    savedContext: string
): boolean {
    if (!currentContext || !savedContext) return false;
    if (currentContext === savedContext) return false;

    if (currentContext === savedContext) return false;

    // Only update if the content has meaningfully changed
    // Use similar logic to bookmark validation but more lenient
    const similarity = calculateTextSimilarity(currentContext, savedContext);

    // Update if similarity is between 30-90% (significant but not complete change)
    return similarity >= 0.3 && similarity <= 0.9;
}

export function calculateTextSimilarity(text1: string, text2: string): number {
    if (!text1 || !text2) return 0;
    if (text1 === text2) return 1;

    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;

    if (longer.length === 0) return 1;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
}

export function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
        .fill(null)
        .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + indicator
            );
        }
    }

    return matrix[str2.length][str1.length];
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

// Enhanced HTML-aware bookmark validation
function isBookmarkStillValidEnhanced(
    container: Element,
    bookmark: Bookmark
): boolean {
    try {
        const currentContext = getContextAtPosition(
            container,
            bookmark.position
        );

        if (!currentContext) {
            return false;
        }

        const savedContext = bookmark.contextText.trim();

        // If either extraction failed, fall back to direct comparison
        if (!savedContext || !currentContext) {
            return savedContext === currentContext;
        }

        // If exact text match, definitely valid
        if (savedContext === currentContext) {
            return true;
        }

        // If one text contains the other, probably valid (handles expansions/contractions)
        if (
            currentContext.includes(savedContext) ||
            savedContext.includes(currentContext)
        ) {
            return true;
        }

        // For very short contexts, be more strict but allow minor changes
        if (savedContext.length < 15) {
            const distance = levenshteinDistance(savedContext, currentContext);
            return distance <= Math.max(2, savedContext.length * 0.3); // Allow 30% changes for short text
        }

        // For longer contexts, try multiple strategies - require at least one to pass
        const strategies = [
            () => hasSignificantWordOverlap(savedContext, currentContext, 0.6), // 60% word overlap
            () => isFuzzyMatch(savedContext, currentContext, 0.35), // Allow 35% character differences
            () => preservesKeyPhrases(savedContext, currentContext, 0.5), // 50% key phrases preserved
        ];

        // At least one strategy must pass for longer content
        return strategies.some((strategy) => strategy());
    } catch (error) {
        console.error(`Error validating bookmark ${bookmark.id}:`, error);
        return false;
    }
}

// Supporting validation functions
function hasSignificantWordOverlap(
    original: string,
    current: string,
    threshold: number
): boolean {
    const originalWords = extractSignificantWords(original);
    const currentWords = extractSignificantWords(current);

    if (originalWords.length === 0) return false;

    const commonWords = originalWords.filter((word) =>
        currentWords.some(
            (currentWord) =>
                // Allow partial word matches and stemming-like comparison
                currentWord.includes(word) ||
                word.includes(currentWord) ||
                (word.length > 4 &&
                    currentWord.length > 4 &&
                    levenshteinDistance(word, currentWord) <= 2)
        )
    );

    const overlap = commonWords.length / originalWords.length;
    return overlap >= threshold;
}

function extractSignificantWords(text: string): string[] {
    // Remove common stop words and extract meaningful words
    const stopWords = new Set([
        "the",
        "a",
        "an",
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
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
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
    ]);

    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word));
}

function isFuzzyMatch(
    original: string,
    current: string,
    maxDifferenceRatio: number
): boolean {
    if (original === current) return true;

    const distance = levenshteinDistance(original, current);
    const maxLength = Math.max(original.length, current.length);
    const differenceRatio = distance / maxLength;

    return differenceRatio <= maxDifferenceRatio;
}

function preservesKeyPhrases(
    original: string,
    current: string,
    threshold: number = 0.6
): boolean {
    const keyPhrases = extractKeyPhrases(original);

    if (keyPhrases.length === 0) {
        // Fallback to simple substring check for very short contexts
        return (
            current.toLowerCase().includes(original.toLowerCase()) ||
            original.toLowerCase().includes(current.toLowerCase())
        );
    }

    // Check if most key phrases are still present (with fuzzy matching)
    const preservedPhrases = keyPhrases.filter(
        (phrase) =>
            current.toLowerCase().includes(phrase.toLowerCase()) ||
            // Allow slight variations in phrases
            keyPhrases.some(
                (currentPhrase) =>
                    levenshteinDistance(
                        phrase.toLowerCase(),
                        currentPhrase.toLowerCase()
                    ) <= 2
            )
    );

    return preservedPhrases.length >= Math.ceil(keyPhrases.length * threshold);
}

function extractKeyPhrases(text: string, minLength = 3): string[] {
    // Extract phrases of 2-4 words that might be important
    const words = text
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 0);
    const phrases: string[] = [];

    // Don't extract phrases from very short text
    if (words.length < 3) return [];

    // Extract 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        if (phrase.length >= minLength) {
            phrases.push(phrase);
        }
    }

    // Extract 3-word phrases for longer contexts
    if (words.length >= 6) {
        for (let i = 0; i < words.length - 2; i++) {
            const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
            phrases.push(phrase);
        }
    }

    return phrases;
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
