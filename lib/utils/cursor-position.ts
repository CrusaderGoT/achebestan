// utils/cursorPosition.ts
export function getCursorPositionInfo() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);

    // Find the closest text container element
    let container = range.startContainer;
    while (
        container &&
        container.parentNode &&
        container.nodeType !== Node.ELEMENT_NODE
    ) {
        container = container.parentNode;
    }

    if (
        !container ||
        !["P", "H1", "H2", "H3", "H4", "H5", "H6", "DIV", "SPAN"].includes(
            (container as Element).tagName
        )
    ) {
        let parent = container?.parentElement;
        while (
            parent &&
            !["P", "H1", "H2", "H3", "H4", "H5", "H6", "DIV"].includes(
                parent.tagName
            )
        ) {
            parent = parent.parentElement;
        }
        if (parent) {
            container = parent;
        }
    }

    if (!container) return null;

    const containerElement = container as Element;
    const containerSelector = generateSelector(containerElement);
    const fullText = containerElement.textContent || "";

    // Calculate actual position within container text
    const beforeRange = document.createRange();
    beforeRange.setStart(containerElement, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);
    const actualPosition = beforeRange.toString().length;

    // Get context text (40 chars before and after)
    const contextStart = Math.max(0, actualPosition - 40);
    const contextEnd = Math.min(fullText.length, actualPosition + 40);
    const contextText = fullText.substring(contextStart, contextEnd);

    return {
        containerSelector,
        position: actualPosition,
        contextText: contextText.trim(),
        containerElement,
    };
}

function generateSelector(element: Element): string {
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
        return `${generateSelector(parent)} > ${tagName}:nth-of-type(${index})`;
    }

    return tagName;
}
