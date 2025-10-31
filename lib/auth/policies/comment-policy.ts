// lib/auth/policies/comment-policy.ts
"use server";

import { CommentSelectType, CommentUpdateType } from "@/zod-schemas/comment";
import { UserSelectType } from "@/zod-schemas/user";
import { BasePolicy } from "./base-policy";

type CommentType = Partial<CommentSelectType> | Partial<CommentUpdateType>;

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
     */
    public static async create(
        user: UserSelectType,
        comment?: CommentType
    ): Promise<CommentPolicy> {
        return new CommentPolicy(user, comment);
    }

    private isOwner(): boolean {
        return this.comment?.userId === this.user.id;
    }

    public async canCreate(): Promise<boolean> {
        return CommentPolicy.hasPermission("comment", ["create:owner"]);
    }

    public async canDelete(): Promise<boolean> {
        // Check if user has delete:all permission OR (delete:owner AND is owner)
        const [hasDeleteAll, hasDeleteOwner] = await Promise.all([
            CommentPolicy.hasPermission("comment", ["delete:all"]),
            CommentPolicy.hasPermission("comment", ["delete:owner"]),
        ]);

        return hasDeleteAll || (hasDeleteOwner && this.isOwner());
    }

    public async canUpdate(): Promise<boolean> {
        const hasUpdateOwner = await CommentPolicy.hasPermission("comment", [
            "update:owner",
        ]);
        return hasUpdateOwner && this.isOwner();
    }
}
