import { defaultStatements } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";

const customPermissions = {
    ...defaultStatements,
    story: ["create", "share", "update", "delete"],
    organization: ["create", "update", "delete"],
} as const;

export const customAccessControl = createAccessControl(customPermissions);

export const writer = customAccessControl.newRole({
    story: ["create", "delete", "update", "share"],
});
