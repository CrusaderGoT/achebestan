// lib/auth/policies/comment-policy.ts

import { PermissionsForResource } from "@/types/permissions";
import { CommentSelectType, CommentUpdateType } from "@/zod-schemas/comment";
import { UserSelectType } from "@/zod-schemas/user";
import { headers } from "next/headers";
import { auth } from "../auth";

type Comment = Partial<CommentSelectType> | Partial<CommentUpdateType>;

export class CommentPolicy {
    private readonly user: UserSelectType;
    private readonly comment?: Comment;
    private readonly requestHeaders: Headers;

    private constructor(
        user: UserSelectType,
        requestHeaders: Headers,
        comment?: Comment
    ) {
        this.user = user;
        this.comment = comment;
        this.requestHeaders = requestHeaders;
    }

    /**
     * Factory method to create a policy instance with current request headers
     */
    public static async create(
        user: UserSelectType,
        comment?: Comment
    ): Promise<CommentPolicy> {
        const requestHeaders = await headers();
        return new CommentPolicy(user, requestHeaders, comment);
    }

    private isOwner(): boolean {
        return this.comment?.userId === this.user.id;
    }

    private async hasPermission(
        permissions: PermissionsForResource<"comment">[]
    ): Promise<boolean> {
        try {
            const result = await auth.api.hasPermission({
                headers: this.requestHeaders,
                body: {
                    permissions: {
                        comment: permissions,
                    },
                },
            });
            return result.success;
        } catch (error) {
            console.error("Permission check failed:", error);
            return false;
        }
    }

    public async canCreate(): Promise<boolean> {
        return this.hasPermission(["create:owner"]);
    }

    public async canDelete(): Promise<boolean> {
        // Check if user has delete:all permission OR (delete:owner AND is owner)
        const [hasDeleteAll, hasDeleteOwner] = await Promise.all([
            this.hasPermission(["delete:all"]),
            this.hasPermission(["delete:owner"]),
        ]);

        return hasDeleteAll || (hasDeleteOwner && this.isOwner());
    }

    public async canUpdate(): Promise<boolean> {
        const hasUpdateOwner = await this.hasPermission(["update:owner"]);
        return hasUpdateOwner && this.isOwner();
    }
}
