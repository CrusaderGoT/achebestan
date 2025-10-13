// Permissions >> resource owner
// WARNING! THEY ARE TO BE THOUGHT IN INSTANCES OF ALL ASPECT OF THAT RESOURCE.
// e.g, A DELTE PERM WILL ALLOW HAVERS TO DO WHAT IT PERMITS IRREGARDLESS OF RESOURCE OWNER
// ALWAYS ACCOUNT FOR INSTANCE A ROLE SHOULD NOT HAVE ORGANIZATION WIDE PERMISSION

import { createAccessControl } from "better-auth/plugins/access";
import {
    adminAc,
    defaultStatements,
} from "better-auth/plugins/organization/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const customPermissions = {
    ...defaultStatements,
    story: ["create", "delete", "suspend"],
    comment: ["create", "delete"],
} as const;

export const customAccessControl = createAccessControl(customPermissions);

// ROLES

export const user = customAccessControl.newRole({
    comment: ["create"],
});

export const writer = customAccessControl.newRole({
    story: ["create"],
    comment: ["create"],
});

export const admin = customAccessControl.newRole({
    ...adminAc.statements,
    story: [...customPermissions.story],
    comment: [...customPermissions.comment],
});
