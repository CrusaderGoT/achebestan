import { createAccessControl } from "better-auth/plugins/access";
import {
    adminAc,
    defaultStatements
} from "better-auth/plugins/admin/access";

const customPermissions = {
    ...defaultStatements,
    story: ["create", "share", "update", "delete"],
    organization: ["create", "update", "delete"],
} as const;

export const customAccessControl = createAccessControl(customPermissions);

export const user = customAccessControl.newRole({
    story: ["share"],
});

export const admin = customAccessControl.newRole({
    story: ["create", "delete", "update", "share"],
    ...adminAc.statements,
});

export const writer = customAccessControl.newRole({
    story: ["create", "delete", "update", "share"],
});
