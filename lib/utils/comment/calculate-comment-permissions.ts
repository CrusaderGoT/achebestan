// lib/utils/comment/comment-permissions.ts
"use server";

import {
    canCreateComment,
    canDeleteAllComment,
    canDeleteOwnComment,
    canUpdateComment,
} from "@/lib/auth/policies";
import {
    CommentPartialType,
    CommentPermissionsType,
    FlattenedCommentIdsType,
} from "@/types/comment";
import { UserSelectType } from "@/types/user";

/**
 * Calculate all permissions for a single comment
 */
export async function calculateCommentPermissions(
    user: UserSelectType | null | undefined,
    comment: FlattenedCommentIdsType,
): Promise<CommentPermissionsType> {
    if (!user?.id) {
        return {
            canDeleteOwn: false,
            canDeleteAll: false,
            canUpdate: false,
            canCreate: false,
        };
    }

    const commentForPolicy: CommentPartialType = {
        id: comment.id,
        userId: comment.userId,
    };

    const [canDeleteAll, canDeleteOwn, canUpdate, canCreate] =
        await Promise.all([
            canDeleteAllComment(commentForPolicy),
            canDeleteOwnComment(user, commentForPolicy),
            canUpdateComment(user, commentForPolicy),
            canCreateComment(),
        ]);

    return {
        canDeleteOwn,
        canDeleteAll,
        canUpdate,
        canCreate,
    };
}

/**
 * Batch calculate permissions for multiple comments in parallel
 */
export async function batchCalculateCommentPermissions(
    user: UserSelectType | null | undefined,
    comments: FlattenedCommentIdsType[],
): Promise<Map<number, CommentPermissionsType>> {
    const permissionsMap = new Map<number, CommentPermissionsType>();

    if (!user?.id) {
        comments.forEach((comment) => {
            permissionsMap.set(comment.id, {
                canDeleteOwn: false,
                canDeleteAll: false,
                canUpdate: false,
                canCreate: false,
            });
        });
        return permissionsMap;
    }

    // Calculate all permissions in parallel
    const permissionsPromises = comments.map((comment) =>
        calculateCommentPermissions(user, comment),
    );

    const permissionsResults = await Promise.all(permissionsPromises);

    comments.forEach((comment, index) => {
        permissionsMap.set(comment.id, permissionsResults[index]);
    });

    return permissionsMap;
}
