import { DRAWER_CONFIG } from "@/components/comment/comment-tree";
import { RatingSelectType } from "@/zod-schemas/rating";
import { TreeNodeData } from "@mantine/core";
import { CommentsToTreeNodeDataType, CommentTreeProps } from "../types/comment";

// STORY HELPERS

export function calculateRatingsAverage(
    ratings: RatingSelectType[],
    updateUserRating?: RatingSelectType
) {
    if (ratings.length < 1 && !updateUserRating) return 0;

    // Create a copy of ratings to work with
    const workingRatings = [...ratings];

    // Handle user rating update/addition
    if (updateUserRating?.userId) {
        const existingIndex = workingRatings.findIndex(
            (r) => r.userId === updateUserRating.userId
        );

        if (existingIndex >= 0) {
            // Update existing rating
            workingRatings[existingIndex] = updateUserRating;
        } else {
            // Add new rating
            workingRatings.push(updateUserRating);
        }
    }

    // Remove duplicates by keeping the latest rating per user
    const uniqueRatings = new Map<string, RatingSelectType>();

    workingRatings.forEach((rating) => {
        if (rating.userId) {
            uniqueRatings.set(rating.userId, rating);
        }
    });

    const uniqueRatingsArray = Array.from(uniqueRatings.values());

    if (uniqueRatingsArray.length === 0) return 0;

    // Calculate average from unique ratings
    const totalStars = uniqueRatingsArray.reduce(
        (sum, rating) => sum + rating.stars,
        0
    );
    return totalStars / uniqueRatingsArray.length;
}

export function highestRating(ratings: RatingSelectType[]) {
    if (ratings.length < 1) return 0;

    return Math.max(...ratings.map((r) => r.stars));
}

export function lowestRating(ratings: RatingSelectType[]) {
    if (ratings.length < 1) return 0;

    return Math.min(...ratings.map((r) => r.stars));
}

// Helper function to truncate text for descriptions
export function truncateText(text: string, maxLength: number = 160): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, "") + "...";
}

// Helper function to extract reading time estimate
export function estimateReadingTime(content: string): number {
    const wordsPerMinute = 238; // average-reading-speed > https://scholarwithin.com/average-reading-speed
    const wordCount = content.split(/\s+/).length;

    return Math.round(wordCount / wordsPerMinute);
}

export function formatEstimatedReadingTime(mins: number) {
    if (mins <= 0) return "a quick read";

    if (mins < 1 && mins > 0) {
        const timeInSeconds = Math.round(mins * 60);
        return timeInSeconds === 1
            ? `${timeInSeconds} second read`
            : `${timeInSeconds} seconds read`;
    }

    if (mins >= 60) {
        const timeInHours = Math.round(mins / 60);
        return timeInHours === 1
            ? `${timeInHours} hour read`
            : `${timeInHours} hours read`;
    }

    const timeInMinutes = Math.round(mins);

    return timeInMinutes === 1
        ? `${timeInMinutes} minute read`
        : `${timeInMinutes} minutes read`;
}

// Helper function to create engaging tweet text
export function createTweetText(story: {
    title: string;
    subtitle?: string | null;
    blurb?: string | null;
}): string {
    const { title, subtitle, blurb } = story;

    // Start with the title
    let text = `${title}`;

    // Add subtitle if available and space allows
    if (subtitle && (text + ` - ${subtitle}`).length <= 200) {
        text += ` - ${subtitle}`;
    }

    // Add a compelling excerpt from blurb if available
    if (blurb && text.length <= 180) {
        const excerpt = createExcerpt(blurb, 200 - text.length - 10); // Leave space for ellipsis and spacing
        if (excerpt) {
            text += `\n\n${excerpt}`;
        }
    }

    return text;
}

// Helper function to create a smart excerpt from the blurb
export function createExcerpt(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;

    // Find the last complete sentence that fits
    const sentences = text.split(/[.!?]+/);
    let excerpt = "";

    for (const sentence of sentences) {
        const potential = excerpt + sentence.trim() + ".";
        if (potential.length <= maxLength - 3) {
            // Leave space for "..."
            excerpt = potential;
        } else {
            break;
        }
    }

    // If no complete sentence fits, truncate at word boundary
    if (!excerpt) {
        excerpt = text.substring(0, maxLength - 3);
        const lastSpace = excerpt.lastIndexOf(" ");
        if (lastSpace > 0) {
            excerpt = excerpt.substring(0, lastSpace);
        }
    }

    return excerpt + (excerpt.length < text.length ? "..." : "");
}

// COMMENT HELPERS

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

export function commentsToTreeNodeData(
    comments: CommentTreeProps[]
): CommentsToTreeNodeDataType {
    return comments.map((comment) => {
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
}
