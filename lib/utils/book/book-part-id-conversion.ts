// --- Type conversion utilities ---

import { ComboboxItem } from "@mantine/core";

/** ComboboxItem | null  →  number | null  (for form field / DB foreign key) */
export function toFormBookId(
    bookId: ComboboxItem | null | undefined,
): number | null {
    if (!bookId?.value) return null;
    const parsed = Number(bookId.value);
    return isNaN(parsed) ? null : parsed;
}

/** number | null  →  ComboboxItem | null  (restore UI select state from a stored id + label) */
export function toUiBookId(
    id: number | null | undefined,
    label: string,
): ComboboxItem | null {
    if (!id) return null;
    return { value: String(id), label };
}
