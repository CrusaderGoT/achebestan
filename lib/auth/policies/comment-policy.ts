// ============================================================
// lib/auth/policies/comment-policy.ts
"use server";

import { CommentPartialType } from "@/types/comment";
import { UserSelectType } from "@/types/user";
import { hasPermission } from "./base-policy";

/**
 * Check if the current user owns the comment
 */
function isCommentOwner(
    user: UserSelectType,
    comment: CommentPartialType
): boolean {
    if (!comment.userId) {
        return false;
    }
    return comment.userId === user.id;
}

/**
 * Check if user can create comment
 */
export async function canCreateComment(): Promise<boolean> {
    return hasPermission("comment", ["create:owner"]);
}

/**
 * Check if user can delete all comment
 * User can delete if they have:
 * - delete:all permission
 */
export async function canDeleteAllComment(
    comment: CommentPartialType
): Promise<boolean> {
    if (!comment) {
        return false;
    }

    // Check delete:all first (most permissive)
    const hasDeleteAll = await hasPermission("comment", ["delete:all"]);

    return hasDeleteAll;
}

/**
 * Check if user can delete the comment
 * User can delete if they have:
 * - delete:owner permission AND they own the comment
 */
export async function canDeleteOwnComment(
    user: UserSelectType,
    comment: CommentPartialType
): Promise<boolean> {
    if (!comment) {
        return false;
    }

    // Check delete:owner with ownership
    if (!isCommentOwner(user, comment)) {
        return false;
    }

    return hasPermission("comment", ["delete:owner"]);
}

/**
 * Check if user can update the comment
 * User can update if they have update:owner permission AND own the comment
 */
export async function canUpdateComment(
    user: UserSelectType,
    comment: CommentPartialType
): Promise<boolean> {
    if (!comment || !isCommentOwner(user, comment)) {
        return false;
    }

    return hasPermission("comment", ["update:owner"]);
}
