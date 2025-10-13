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
export function useAutoExpandComments({
    commentsNodeData,
    tree,
}: AutoExpandCommentsProps) {
    // Track which comment IDs have been auto-expanded
    const autoExpandedRef = useRef<Set<number>>(new Set());

    // Track the last processed comment ID to detect new additions
    const lastProcessedIdRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        // Early exit if no comments
        if (commentsNodeData.length === 0) return;

        // Get the latest comment (last in array after revalidatePath)
        const latestComment = commentsNodeData[commentsNodeData.length - 1];

        // Skip if we've already processed this comment
        if (lastProcessedIdRef.current === latestComment.id) {
            return;
        }

        // Skip if already expanded (either by us or manually by user)
        if (
            autoExpandedRef.current.has(latestComment.id) ||
            tree.expandedState[latestComment.value]
        ) {
            lastProcessedIdRef.current = latestComment.id;
            return;
        }

        // Expand the new comment
        try {
            tree.expand(latestComment.value);
            autoExpandedRef.current.add(latestComment.id);
            lastProcessedIdRef.current = latestComment.id;
        } catch (error) {
            console.error("Error auto-expanding comment:", error);
        }
    }, [commentsNodeData, tree, tree.expandedState]);

    // Optional: Cleanup function to reset state if needed
    const reset = () => {
        autoExpandedRef.current.clear();
        lastProcessedIdRef.current = undefined;
    };

    return { reset };
}

// ============================================
// USAGE EXAMPLE
// ============================================

/*
function YourComponent() {
    const commentsNodeData = // ... your comments data
    const tree = // ... your tree instance

    // Use the hook
    const { reset } = useAutoExpandComments({ 
        commentsNodeData, 
        tree 
    });

    // Optionally reset the auto-expand tracking
    // when needed (e.g., when switching to a different thread)
    const handleThreadChange = () => {
        reset();
    };

    return (
        // ... your JSX
    );
}
*/

// ============================================
// ALTERNATIVE: Expand ALL New Comments
// ============================================

/**
 * Alternative approach that expands ALL new comments at once
 * Use this if multiple comments can be added simultaneously
 

export function useAutoExpandAllNewComments({ 
    commentsNodeData, 
    tree 
}: AutoExpandCommentsProps) {
    const autoExpandedRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        // Find all comments that haven't been auto-expanded yet
        const newComments = commentsNodeData.filter(
            comment => 
                !autoExpandedRef.current.has(comment.id) && 
                !tree.expandedState[comment.value]
        );

        // No new comments to expand
        if (newComments.length === 0) return;

        // Expand all new comments
        try {
            newComments.forEach(comment => {
                tree.expand(comment.value);
                autoExpandedRef.current.add(comment.id);
            });
        } catch (error) {
            console.error('Error auto-expanding comments:', error);
        }
    }, [commentsNodeData, tree, tree.expandedState]);

    const reset = () => {
        autoExpandedRef.current.clear();
    };

    return { reset };
}

// ============================================
// PERFORMANCE-OPTIMIZED VERSION
// ============================================


 * Most efficient version - only re-runs when array length changes
 * Best for scenarios where comments are only appended (never removed/reordered)
 
export function useAutoExpandCommentsOptimized({ 
    commentsNodeData, 
    tree 
}: AutoExpandCommentsProps) {
    const autoExpandedRef = useRef<Set<number>>(new Set());
    const lastLengthRef = useRef(0);

    useEffect(() => {
        const currentLength = commentsNodeData.length;
        
        // Only process if array grew (new comments added)
        if (currentLength <= lastLengthRef.current) {
            lastLengthRef.current = currentLength;
            return;
        }

        // Get all new comments since last check
        const newComments = commentsNodeData.slice(lastLengthRef.current);
        
        // Expand each new comment that isn't already expanded
        try {
            newComments.forEach(comment => {
                if (
                    !autoExpandedRef.current.has(comment.id) &&
                    !tree.expandedState[comment.value]
                ) {
                    tree.expand(comment.value);
                    autoExpandedRef.current.add(comment.id);
                }
            });
        } catch (error) {
            console.error('Error auto-expanding comments:', error);
        }

        lastLengthRef.current = currentLength;
    }, [commentsNodeData.length, tree, tree.expandedState]);

    const reset = () => {
        autoExpandedRef.current.clear();
        lastLengthRef.current = 0;
    };

    return { reset };
}
*/
