// ============================================================
// lib/auth/policies/comment-policy.ts

import { CommentSelectType, CommentUpdateType } from "@/zod-schemas/comment";
import { UserSelectType } from "@/zod-schemas/user";
import { BasePolicy } from "./base-policy";

type CommentType = Partial<CommentSelectType> | Partial<CommentUpdateType>;

/**
 * Policy class for comment-related authorization
 */
export class CommentPolicy extends BasePolicy {
    private readonly user: UserSelectType;
    private readonly comment?: CommentType;

    private constructor(user: UserSelectType, comment?: CommentType) {
        super();
        this.user = user;
        this.comment = comment;
    }

    /**
     * Factory method to create a policy instance
     * Note: Not async as no async initialization is needed
     */
    public static create(
        user: UserSelectType,
        comment?: CommentType
    ): CommentPolicy {
        return new CommentPolicy(user, comment);
    }

    /**
     * Check if the current user owns the comment
     */
    private isOwner(): boolean {
        if (!this.comment?.userId) {
            return false;
        }
        return this.comment.userId === this.user.id;
    }

    /**
     * Check if user can create comments
     */
    public async canCreate(): Promise<boolean> {
        return this.hasPermission("comment", ["create:owner"]);
    }

    /**
     * Check if user can delete the comment
     * User can delete if they have:
     * - delete:all permission, OR
     * - delete:owner permission AND they own the comment
     */
    public async canDelete(): Promise<boolean> {
        if (!this.comment) {
            return false;
        }

        // Check delete:all first (most permissive)
        const hasDeleteAll = await this.hasPermissionSafe("comment", [
            "delete:all",
        ]);
        if (hasDeleteAll) {
            return true;
        }

        // Check delete:owner with ownership
        if (!this.isOwner()) {
            return false;
        }

        return this.hasPermission("comment", ["delete:owner"]);
    }

    /**
     * Check if user can update the comment
     * User can update if they have update:owner permission AND own the comment
     */
    public async canUpdate(): Promise<boolean> {
        if (!this.comment || !this.isOwner()) {
            return false;
        }

        return this.hasPermission("comment", ["update:owner"]);
    }

    /**
     * Check if user can view the comment
     * Add this if you have view permissions
     */
    public async canRead(): Promise<boolean> {
        return this.hasPermission("comment", ["read:all"]);
    }
}