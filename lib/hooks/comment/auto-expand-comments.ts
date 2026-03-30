import { CommentsToTreeNodeDataType } from "@/types/comment";
import { UseTreeReturnType } from "@mantine/core";
import { useEffect, useRef } from "react";

interface AutoExpandCommentsProps {
    commentsNodeData: CommentsToTreeNodeDataType;
    tree: UseTreeReturnType;
}

/**
 * Custom hook for auto-expanding new comments in a tree structure
 * Efficiently tracks and expands only newly added comments after revalidation
 */
export function useAutoExpandNewComments({
    commentsNodeData,
    tree,
}: AutoExpandCommentsProps) {
    const autoExpandedRef = useRef<Set<number>>(new Set());
    const previousCommentIdsRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        const currentCommentIds = new Set(commentsNodeData.map((c) => c.id));

        // Find truly new comments (present now but weren't present before)
        const newComments = commentsNodeData.filter(
            (comment) =>
                !previousCommentIdsRef.current.has(comment.id) &&
                !autoExpandedRef.current.has(comment.id) &&
                !comment.hasBeenDeleted
        );

        // Update the previous comments set for next comparison
        previousCommentIdsRef.current = currentCommentIds;

        // No new comments to expand
        if (newComments.length === 0) return;

        // Expand all new comments
        try {
            newComments.forEach((comment) => {
                tree.expand(comment.value);
                autoExpandedRef.current.add(comment.id);
            });
        } catch (error) {
            console.error("Error auto-expanding comments:", error);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commentsNodeData]);

    const reset = () => {
        autoExpandedRef.current.clear();
        previousCommentIdsRef.current.clear();
    };

    return { reset };
}
