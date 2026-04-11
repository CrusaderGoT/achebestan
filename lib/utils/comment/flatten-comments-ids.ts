import { CommentTreeProps, FlattenedCommentIdsType } from "@/types/comment";

/**
 * Helper function to flatten all ids in a nested comment structure
 */
export function flattenCommentsIds(
    comments: CommentTreeProps[],
): FlattenedCommentIdsType[] {
    const flat: FlattenedCommentIdsType[] = [];

    function flatten(commentList: CommentTreeProps[]): void {
        for (const comment of commentList) {
            flat.push({ id: comment.id, userId: comment.userId });
            if (comment.childComments?.length) {
                flatten(comment.childComments);
            }
        }
    }

    flatten(comments);
    return flat;
}
