// Comment Tree Utils and Helpers

import { DRAWER_CONFIG } from "@/components/comment/comment-tree";
import { CommentsToTreeNodeDataType, CommentTreeProps } from "@/types/comment";
import { TreeNodeData } from "@mantine/core";

export class CommentTreeUtils {
    static shouldShowDrawerButton(
        level: number,
        hasChildren: boolean
    ): boolean {
        return DRAWER_CONFIG.drawerLevel === level && hasChildren;
    }

    static calculateIndentation(level: number, isInDrawer: boolean): number {
        // IMPROVEMENT: Make indentation configurable
        const INDENTATION_SIZE = 23;
        return isInDrawer
            ? (level - 1) * INDENTATION_SIZE
            : (level - 1) * INDENTATION_SIZE;
    }

    // IMPROVEMENT: Add validation and better error handling
    static getCommentWithChildren(
        commentId: string,
        nodeData: CommentsToTreeNodeDataType
    ): CommentsToTreeNodeDataType {
        if (!commentId || !nodeData || nodeData.length === 0) {
            return [];
        }

        const findNodeRecursively = (
            nodes: CommentsToTreeNodeDataType,
            targetId: string
        ): TreeNodeData | null => {
            for (const node of nodes) {
                if (node.value === targetId) {
                    return node;
                }
                if (node.children && Array.isArray(node.children)) {
                    const found = findNodeRecursively(
                        node.children as CommentsToTreeNodeDataType,
                        targetId
                    );
                    if (found) return found;
                }
            }
            return null;
        };

        try {
            const targetNode = findNodeRecursively(nodeData, commentId);
            return targetNode
                ? [targetNode as CommentsToTreeNodeDataType[0]]
                : [];
        } catch (error) {
            console.error("Error finding comment node:", error);
            return [];
        }
    }

    static initialExpandCount = 10;
}

export function buildCommentHierarchy(
    comments: CommentTreeProps[]
): CommentTreeProps[] {
    const commentMap = new Map<number, CommentTreeProps>();
    const topLevel: CommentTreeProps[] = [];

    // First pass: create all comment objects
    comments.forEach((comment) => {
        commentMap.set(comment.id, {
            ...comment,
            childComments: [],
            rating: comment.rating,
            user: comment.user,
        });
    });

    // Second pass: build hierarchy
    comments.forEach((comment) => {
        const commentWithChildren = commentMap.get(comment.id)!;

        if (comment.parentCommentId) {
            // This is a child comment
            const parent = commentMap.get(comment.parentCommentId);
            if (parent) {
                parent.childComments = parent.childComments || [];
                parent.childComments.push(commentWithChildren);
            }
        } else {
            // This is a top-level comment
            topLevel.push(commentWithChildren);
        }
    });

    return topLevel;
}

export function commentsToTreeNodeData(
    comments: CommentTreeProps[]
): CommentsToTreeNodeDataType {
    return comments.map((comment) => {
        //filter out deleted comment data
        if (comment.hasBeenDeleted) {
            comment.user = null;
            comment.text = "Deleted";
        }

        const baseNode = {
            value: `${comment.id}`,
            label: comment.text,
            ...comment,
            rating: comment.rating,
        };

        if (comment.childComments?.length) {
            return {
                ...baseNode,
                children: commentsToTreeNodeData(comment.childComments),
            };
        }

        return baseNode;
    });
}

export const flattenComments = (
    comments: CommentsToTreeNodeDataType,
    map: Map<string, CommentTreeProps>
) => {
    comments.forEach((comment) => {
        map.set(comment.value, comment);
        if (comment.children) {
            flattenComments(
                comment.children as CommentsToTreeNodeDataType,
                map
            );
        }
    });
};
