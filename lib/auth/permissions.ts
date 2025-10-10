// Permissions >> resource owner
// WARNING! THEY ARE TO BE THOUGHT IN INSTANCES OF ALL ASPECT OF THAT RESOURCE.
// e.g, A DELTE PERM WILL ALLOW HAVERS TO DO WHAT IT PERMITS IRREGARDLESS OF RESOURCE OWNER
// ALWAYS ACCOUNT FOR INSTANCE A ROLE SHOULD NOT HAVE ORGANIZATION WIDE PERMISSION

import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const customPermissions = {
    ...defaultStatements,
    story: ["create", "update", "delete"],
    organization: ["create", "update", "delete"],
    comment: ["create", "update", "delete"],
} as const;

export const customAccessControl = createAccessControl(customPermissions);

export const user = customAccessControl.newRole({
    comment: ["create"]
});

export const admin = customAccessControl.newRole({
    ...adminAc.statements,
    story: [...customPermissions.story],
    comment: [...customPermissions.comment],
});

export const writer = customAccessControl.newRole({
    story: ["create"],
});
