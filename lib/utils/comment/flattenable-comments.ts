import { FlattenableComment } from "@/types/comment";

/**
 * Helper function to flatten nested comment structure
 */
export function flattenComments<T extends FlattenableComment>(
    comments: T[]
): T[] {
    const flat: T[] = [];

    function flatten(commentList: T[]): void {
        for (const comment of commentList) {
            flat.push(comment);
            if (comment.childComments?.length) {
                flatten(comment.childComments as T[]);
            }
        }
    }

    flatten(comments);
    return flat;
}
