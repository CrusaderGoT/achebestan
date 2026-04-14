// ============================================================
// lib/auth/policies/story-policy.ts
"use server";

import { StoryPermissionsType, StorySelectType } from "@/types/story";
import { UserSelectType } from "@/types/user";
import { hasPermission } from "./base-policy";
import { canCreateComment } from "./comment-policy";

export type PartialStoryType = Partial<StorySelectType>;

/**
 * Check if the current user owns the story
 */
function isStoryOwner(user: UserSelectType, story: PartialStoryType): boolean {
    if (!story.authorId) {
        return false;
    }
    return story.authorId === user.id;
}

/**
 * Check if user can create stories
 */
export async function canCreateStory(): Promise<boolean> {
    return hasPermission("story", ["create:owner"]);
}

/**
 * Check if user can delete the story
 * User can delete if they have:
 * - delete:all permission, OR
 * - delete:owner permission AND they own the story
 */
export async function canDeleteStory(
    user: UserSelectType,
    story: PartialStoryType,
): Promise<boolean> {
    if (!story) {
        return false;
    }

    // Check delete:all first (most permissive)
    const hasDeleteAll = await hasPermission("story", ["delete:all"]);
    if (hasDeleteAll) {
        return true;
    }

    // Check delete:owner with ownership
    if (!isStoryOwner(user, story)) {
        return false;
    }

    return hasPermission("story", ["delete:owner"]);
}

/**
 * Check if user can update the story
 * User can update if they have update:owner permission AND own the story
 */
export async function canUpdateStory(
    user: UserSelectType,
    story: PartialStoryType,
): Promise<boolean> {
    if (!isStoryOwner(user, story)) {
        return false;
    }

    return hasPermission("story", ["update:owner"]);
}

/**
 * Check if user can suspend the story
 * User can suspend if they have suspend:all permission
 */
export async function canSuspendStory(): Promise<boolean> {
    return hasPermission("story", ["suspend:all"]);
}

/**
 * Calculate all permissions for a single story
 */

export async function calculateStoryPermissions(
    user: UserSelectType | null | undefined,
    story: { id: number; authorId: string },
): Promise<Omit<StoryPermissionsType, "canCreate">> {
    if (!user?.id) {
        return {
            canDelete: false,
            canUpdate: false,
            canSuspend: false,
            canComment: false,
        };
    }

    const storyPermArgs = {
        id: story.id,
        authorId: story.authorId,
    };

    const [canDelete, canUpdate, canSuspend, canComment] = await Promise.all([
        await canDeleteStory(user, storyPermArgs),
        await canUpdateStory(user, storyPermArgs),
        await canSuspendStory(),
        await canCreateComment(),
    ]);

    return {
        canDelete,
        canUpdate,
        canSuspend,
        canComment,
    };
}
