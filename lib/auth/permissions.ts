// lib/auth/permissions.ts
import { createAccessControl } from "better-auth/plugins/access";
import {
    adminAc,
    defaultStatements,
    memberAc,
    ownerAc,
} from "better-auth/plugins/organization/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
export const customPermissions = {
    ...defaultStatements,
    site: ["create:organization", "create:superadmin", "update:role"],
    comment: ["create:owner", "delete:owner", "update:owner", "delete:all"],
    story: [
        "create:owner",
        "delete:owner",
        "update:owner",
        "suspend:all",
        "delete:all",
    ],
    user: [
        "suspend:org",
        "suspend:all",
        "delete:all",
        "update:org",
        "update:all",
    ],
} as const;

export const customAccessControl = createAccessControl(customPermissions);

// ROLES

export const member = customAccessControl.newRole({
    ...memberAc.statements,
    comment: ["create:owner", "update:owner", "delete:owner"],
});

export const writer = customAccessControl.newRole({
    story: ["create:owner", "update:owner", "delete:owner"],
    comment: ["create:owner", "update:owner", "delete:owner"],
});

export const admin = customAccessControl.newRole({
    ...adminAc.statements,
    story: ["suspend:all", "delete:all"],
    comment: [...customPermissions.comment],
});

export const owner = customAccessControl.newRole({
    ...ownerAc.statements,
    story: ["suspend:all", "delete:all"],
    comment: [...customPermissions.comment],
});

export const superAdmin = customAccessControl.newRole({
    ...ownerAc.statements,
    story: ["suspend:all", "delete:all"],
    comment: [...customPermissions.comment],
    site: [...customPermissions.site],
});
