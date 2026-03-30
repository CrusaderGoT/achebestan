export function generateSelector(element: Element): string {
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

