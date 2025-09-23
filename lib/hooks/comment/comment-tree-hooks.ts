import {
    CommentInteractionHandlers,
    CommentsToTreeNodeDataType,
    CommentTreeProps,
    DrawerState,
} from "@/lib/types/comment";
import { CommentTreeUtils, flattenComments } from "@/lib/utils/helpers";
import { useTree } from "@mantine/core";
import { useFocusTrap, useStateHistory } from "@mantine/hooks";
import { useCallback, useMemo, useState } from "react";

// Hook for comment interactions
export function useCommentInteractions(): CommentInteractionHandlers {
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
    const [activeEditId, setActiveEditId] = useState<number | null>(null);
    const focusTrapRef = useFocusTrap();

    const handleReplyToggle = useCallback((commentId: number) => {
        setActiveReplyId((current) =>
            current === commentId ? null : commentId
        );
    }, []);

    const handleEditToggle = useCallback((commentId: number) => {
        setActiveEditId((current) =>
            current === commentId ? null : commentId
        );
    }, []);

    const handleCloseReply = useCallback(() => setActiveReplyId(null), []);
    const handleCloseEdit = useCallback(() => setActiveEditId(null), []);

    return {
        activeReplyId,
        activeEditId,
        handleReplyToggle,
        handleEditToggle,
        handleCloseReply,
        handleCloseEdit,
        focusTrapRef,
    };
}

export function useDrawerState(
    commentsNodeData: CommentsToTreeNodeDataType
): DrawerState {
    const [drawerOpened, setDrawerOpened] = useState(false);

    const [activeDrawerCommentId, activeDrawerHandlers, drawerHistory] =
        useStateHistory<string | null>(null);

    const drawerTree = useTree({
        multiple: false,
        initialExpandedState: {},
    });

    // IMPROVEMENT: Add error handling and validation
    const { drawerCommentData, drawerCommentMap, drawerTitle } = useMemo(() => {
        if (!activeDrawerCommentId || !drawerOpened) {
            return {
                drawerCommentData: [],
                drawerCommentMap: new Map<string, CommentTreeProps>(),
                drawerTitle: "Comment Thread",
            };
        }

        try {
            const commentWithChildren = CommentTreeUtils.getCommentWithChildren(
                activeDrawerCommentId,
                commentsNodeData
            );

            if (!commentWithChildren || commentWithChildren.length === 0) {
                console.warn(
                    `Comment with ID ${activeDrawerCommentId} not found`
                );
                return {
                    drawerCommentData: [],
                    drawerCommentMap: new Map<string, CommentTreeProps>(),
                    drawerTitle: "Comment Not Found",
                };
            }

            const drawerMap = new Map<string, CommentTreeProps>();
            flattenComments(commentWithChildren, drawerMap);

            // Get the root comment for title
            const rootComment = drawerMap.get(activeDrawerCommentId);

            // IMPROVEMENT: Better title formatting with truncation and escaping
            const getDrawerTitle = (
                comment: CommentTreeProps | undefined
            ): string => {
                if (!comment) return "Comment Thread";

                const author = comment.user?.name;
                const maxTextLength = 50;
                const text =
                    comment.text?.slice(0, maxTextLength) +
                    (comment.text && comment.text.length > maxTextLength
                        ? "..."
                        : "");

                // Escape quotes in text to prevent display issues
                const escapedText = text?.replace(/"/g, '\\"') || "";

                return author
                    ? `Thread by ${author}: "${escapedText}"`
                    : `Comment Thread: ${escapedText}`;
            };

            return {
                drawerCommentData: commentWithChildren,
                drawerCommentMap: drawerMap,
                drawerTitle: getDrawerTitle(rootComment),
            };
        } catch (error) {
            console.error("Error loading comment thread:", error);
            return {
                drawerCommentData: [],
                drawerCommentMap: new Map<string, CommentTreeProps>(),
                drawerTitle: "Error Loading Thread",
            };
        }
    }, [activeDrawerCommentId, drawerOpened, commentsNodeData]);

    // CRITICAL BUG FIX: Completely rewrite handleOpenDrawer
    const handleOpenDrawer = useCallback(
        (commentId: string) => {
            // Set the active comment ID first
            activeDrawerHandlers.set(commentId);

            // Then open the drawer
            setDrawerOpened(true);

            // IMPROVEMENT: Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                drawerTree.expand(commentId);
            });
        },
        [drawerTree, activeDrawerHandlers]
    );

    const closeDrawer = useCallback(() => {
        setDrawerOpened(false);
        // IMPROVEMENT: Only reset if drawer was actually open
        if (activeDrawerCommentId) {
            activeDrawerHandlers.reset();
        }
    }, [activeDrawerHandlers, activeDrawerCommentId]);

    return {
        drawerOpened,
        drawerCommentData,
        drawerCommentMap,
        drawerTree,
        handleOpenDrawer,
        closeDrawer,
        drawerTitle,
        activeDrawerHandlers,
        drawerHistory,
        activeDrawerCommentId,
    };
}
