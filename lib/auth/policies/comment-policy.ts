// lib/auth/policies/comment-policy.ts

import { CommentSelectType, CommentUpdateType } from "@/zod-schemas/comment";
import { UserSelectType } from "@/zod-schemas/user";
import { customPermissions } from "../permissions";

export class CommentPolicy {
    protected readonly user: UserSelectType;
    protected readonly comment?:
        | Partial<CommentSelectType>
        | Partial<CommentUpdateType>;
    private readonly roles: string[];

    constructor(
        user: UserSelectType,
        comment?: Partial<CommentSelectType> | Partial<CommentUpdateType>
    ) {
        this.user = user;
        this.comment = comment;
        this.roles = this.user.role?.split(",") || [];
    }

    static readonly permissions = customPermissions.comment;

    private readonly isOwner = () => this.comment?.userId === this.user.id;

    public canCreate(): boolean {
        return this.roles.includes(CommentPolicy.permissions[0]) || false;
    }

    public canDelete(): boolean {
        return (
            (this.roles.includes(CommentPolicy.permissions[1]) &&
                this.isOwner()) ||
            this.roles.includes(CommentPolicy.permissions[3])
        );
    }

    public canUpdate(): boolean {
        return (
            this.roles.includes(CommentPolicy.permissions[2]) && this.isOwner()
        );
    }
}
